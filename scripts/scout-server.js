// scripts/scout-server.js
// Autonomous Localhost Control Station for Dallas Real Estate Outreach
// Runs at http://localhost:4000 with 0 AI token usage.

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getDiscoveredAgents, crawlCompassDallasDirectory, saveDiscoveredAgents } from "./agent-discovery.js";
import { runAgentPipeline } from "./agent-pipeline.js";
import { getMailerConfig, saveMailerConfig, testConnection, sendOutreachEmail, generatePitch } from "./hostinger-mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const historyPath = path.join(rootDir, "data", "outreach-history.json");

const app = express();
const PORT = process.env.SCOUT_PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. API: DISCOVERED AGENTS
app.get("/api/agents/discovered", (req, res) => {
  try {
    const agents = getDiscoveredAgents();
    res.json({ success: true, agents });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/agents/crawl", async (req, res) => {
  try {
    const updated = await crawlCompassDallasDirectory();
    res.json({ success: true, count: updated.length, agents: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 2. API: ACTIVE ROSTER IN CODEBASE
app.get("/api/agents/roster", (req, res) => {
  try {
    const resolverPath = path.join(rootDir, "src", "composables", "useAgentResolver.js");
    const content = fs.readFileSync(resolverPath, "utf-8");
    const matches = [...content.matchAll(/id:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["'],\s*title:\s*["']([^"']+)["']/g)];
    const roster = matches.map((m) => ({
      id: m[1],
      name: m[2],
      title: m[3],
      liveUrl: `https://realestate-advisory.ayubkhokhar786.workers.dev/${m[1]}`,
      manageUrl: `https://realestate-advisory.ayubkhokhar786.workers.dev/${m[1]}/manage`,
    }));
    res.json({ success: true, roster });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 3. API: RUN ONBOARDING PIPELINE
app.post("/api/agents/onboard", async (req, res) => {
  const { url, slug, autoRegister = true, buildAndDeploy = true, sendEmail = false } = req.body;
  if (!url || !slug) {
    return res.status(400).json({ success: false, error: "Missing required 'url' or 'slug'" });
  }

  const logs = [];
  const logCallback = (msg) => {
    console.log(`[Pipeline] ${msg}`);
    logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  try {
    const result = await runAgentPipeline({
      url,
      slug,
      autoRegister: Boolean(autoRegister),
      buildAndDeploy: Boolean(buildAndDeploy),
      sendEmail: Boolean(sendEmail),
      logCallback,
    });

    // Update discovered list status if present
    const discovered = getDiscoveredAgents();
    const match = discovered.find((d) => d.slug === slug || d.url === url);
    if (match) {
      match.status = "launched";
      match.liveUrl = result.liveUrl;
      saveDiscoveredAgents(discovered);
    }

    res.json({ success: true, result, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs });
  }
});

// 4. API: MAILER SETTINGS & TEST
app.get("/api/mailer/settings", (req, res) => {
  const cfg = getMailerConfig();
  res.json({
    success: true,
    config: {
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      user: cfg.user,
      senderName: cfg.senderName,
      replyTo: cfg.replyTo,
      isPasswordSet: Boolean(cfg.pass),
    },
  });
});

app.post("/api/mailer/settings", (req, res) => {
  try {
    const { host, port, secure, user, pass, senderName, replyTo } = req.body;
    const current = getMailerConfig();
    const updated = {
      host: host || current.host,
      port: Number(port) || current.port,
      secure: secure !== undefined ? Boolean(secure) : current.secure,
      user: user || current.user,
      pass: pass ? pass : current.pass,
      senderName: senderName || current.senderName,
      replyTo: replyTo || current.replyTo,
    };
    saveMailerConfig(updated);
    res.json({ success: true, message: "Settings saved successfully" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/mailer/test", async (req, res) => {
  const result = await testConnection();
  res.json(result);
});

app.post("/api/mailer/preview", (req, res) => {
  try {
    const pitch = generatePitch(req.body);
    res.json({ success: true, pitch });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/mailer/send", async (req, res) => {
  try {
    const result = await sendOutreachEmail(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get("/api/outreach/history", (req, res) => {
  try {
    let history = [];
    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
    }
    res.json({ success: true, history });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 5. EMBEDDED DASHBOARD HTML UI
app.get("*", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dallas Real Estate Outreach Suite · Control Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .tab-active { border-bottom: 2px solid #D4AF37; color: #D4AF37; font-weight: 600; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

  <!-- Header -->
  <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg">
          <i class="fa-solid fa-bolt"></i>
        </div>
        <div>
          <h1 class="font-bold text-lg text-white tracking-wide">Webpenter · Autonomous Realtor Suite</h1>
          <p class="text-xs text-slate-400">Zero-Token Localhost Engine · Dallas Real Estate</p>
        </div>
      </div>

      <div class="flex items-center gap-4 text-sm">
        <div id="smtpBadge" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Hostinger SMTP: <strong class="text-white">ayub@webpenter.com</strong></span>
        </div>
        <button onclick="testSmtpConnection()" class="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition">
          <i class="fa-solid fa-plug mr-1 text-amber-400"></i> Test SMTP
        </button>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <div class="border-b border-slate-800 bg-slate-900">
    <div class="max-w-7xl mx-auto flex gap-8 px-6 text-sm">
      <button onclick="switchTab('discovery')" id="tab-discovery" class="py-3 text-slate-400 hover:text-white tab-active">
        <i class="fa-solid fa-compass mr-2"></i> Agent Discovery Pool
      </button>
      <button onclick="switchTab('custom')" id="tab-custom" class="py-3 text-slate-400 hover:text-white">
        <i class="fa-solid fa-rocket mr-2"></i> Custom URL Onboarder
      </button>
      <button onclick="switchTab('roster')" id="tab-roster" class="py-3 text-slate-400 hover:text-white">
        <i class="fa-solid fa-users mr-2"></i> Live Portals Roster (<span id="rosterCount">6</span>)
      </button>
      <button onclick="switchTab('outbox')" id="tab-outbox" class="py-3 text-slate-400 hover:text-white">
        <i class="fa-solid fa-paper-plane mr-2"></i> Email Outbox & Logs
      </button>
      <button onclick="switchTab('settings')" id="tab-settings" class="py-3 text-slate-400 hover:text-white">
        <i class="fa-solid fa-gear mr-2"></i> Settings (Hostinger)
      </button>
    </div>
  </div>

  <!-- Main Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

    <!-- TAB 1: AGENT DISCOVERY POOL -->
    <section id="view-discovery" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">Dallas High-Potential Agent Pool</h2>
          <p class="text-sm text-slate-400">Rising boutique producers ($5M–$35M) with active listings, direct cell numbers, and zero standalone websites.</p>
        </div>
        <div class="flex gap-2">
          <button onclick="crawlCompass()" id="crawlBtn" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-sm font-medium transition flex items-center gap-2">
            <i class="fa-solid fa-arrows-rotate text-amber-400"></i> Refresh / Crawl Directory
          </button>
        </div>
      </div>

      <!-- Agents Grid -->
      <div id="discoveryList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Loaded via JavaScript -->
        <div class="p-8 text-center text-slate-500 col-span-3">Loading discovered agents...</div>
      </div>
    </section>

    <!-- TAB 2: CUSTOM URL ONBOARDER -->
    <section id="view-custom" class="hidden space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-xl font-bold text-white mb-1">1-Click Custom Agent Onboarder</h2>
        <p class="text-sm text-slate-400 mb-6">Paste any Compass agent URL. The engine scrapes listings, generates high-res galleries, auto-wires the codebase, and deploys to Cloudflare.</p>

        <form id="onboardForm" onsubmit="handleCustomOnboard(event)" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Compass Agent URL</label>
              <input type="url" id="customUrl" required placeholder="https://www.compass.com/agents/brandon-stewart/" 
                class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 font-mono text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">URL Slug (e.g. brandon)</label>
              <input type="text" id="customSlug" required placeholder="brandon" 
                class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 font-mono text-sm">
            </div>
          </div>

          <div class="flex flex-wrap gap-6 py-2">
            <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" id="chkAutoWire" checked class="w-4 h-4 rounded text-amber-500 accent-amber-500">
              Auto-wire router & composables (zero code editing)
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" id="chkDeploy" checked class="w-4 h-4 rounded text-amber-500 accent-amber-500">
              Build & Push to Cloudflare Edge
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" id="chkSendEmail" class="w-4 h-4 rounded text-amber-500 accent-amber-500">
              Auto-send pitch email via ayub@webpenter.com
            </label>
          </div>

          <div class="pt-2">
            <button type="submit" id="onboardSubmitBtn" class="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition flex items-center gap-2">
              <i class="fa-solid fa-play"></i> Launch Autonomous Pipeline
            </button>
          </div>
        </form>
      </div>

      <!-- Execution Console Log Terminal -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
          <span class="font-mono flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500"></span> Engine Terminal Output
          </span>
          <button onclick="clearLogs()" class="hover:text-white">Clear</button>
        </div>
        <div id="consoleLog" class="font-mono text-xs text-slate-300 p-3 h-64 overflow-y-auto space-y-1 bg-slate-950 rounded mt-3">
          <div class="text-slate-500">// System ready. Click 'Launch Autonomous Pipeline' to begin.</div>
        </div>
      </div>
    </section>

    <!-- TAB 3: LIVE PORTALS ROSTER -->
    <section id="view-roster" class="hidden space-y-4">
      <div>
        <h2 class="text-xl font-bold text-white">Live Client Portals</h2>
        <p class="text-sm text-slate-400">Currently active isolated websites on Cloudflare Edge.</p>
      </div>
      <div id="rosterGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Loaded via JavaScript -->
      </div>
    </section>

    <!-- TAB 4: EMAIL OUTBOX & LOGS -->
    <section id="view-outbox" class="hidden space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">Hostinger Outreach Dispatch Log</h2>
          <p class="text-sm text-slate-400">Direct paper trail of emails sent from <strong>ayub@webpenter.com</strong> via Hostinger SMTP.</p>
        </div>
        <button onclick="loadOutreachHistory()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded border border-slate-700">
          <i class="fa-solid fa-arrows-rotate mr-1 text-amber-400"></i> Refresh Logs
        </button>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-4 py-3">Agent</th>
              <th class="px-4 py-3">Recipient</th>
              <th class="px-4 py-3">Subject</th>
              <th class="px-4 py-3">Sent At</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody id="historyTableBody" class="divide-y divide-slate-800">
            <tr>
              <td colspan="6" class="px-4 py-6 text-center text-slate-500">Loading outreach log...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- TAB 5: SETTINGS -->
    <section id="view-settings" class="hidden space-y-6">
      <div class="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-xl font-bold text-white mb-1">Hostinger SMTP Settings</h2>
        <p class="text-sm text-slate-400 mb-6">Send emails directly from your official custom domain mailbox (<code>ayub@webpenter.com</code>) with zero middleman services.</p>

        <form onsubmit="handleSaveSettings(event)" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">SMTP Host</label>
              <input type="text" id="smtpHost" required value="smtp.hostinger.com" class="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Port (SSL)</label>
              <input type="number" id="smtpPort" required value="465" class="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm">
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Hostinger Email Account</label>
            <input type="email" id="smtpUser" required value="ayub@webpenter.com" class="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Password</label>
            <input type="password" id="smtpPass" placeholder="Enter Hostinger email password" class="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm">
            <p class="text-xs text-slate-500 mt-1">Your password is saved securely on your local computer only.</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Sender Display Name</label>
            <input type="text" id="smtpSenderName" value="Ayub Khokhar | Webpenter Real Estate Advisory" class="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm">
          </div>

          <div class="flex items-center gap-3 pt-4">
            <button type="submit" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition">
              Save Settings
            </button>
            <button type="button" onclick="testSmtpConnection()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm rounded-lg transition">
              Test Connection
            </button>
          </div>
        </form>
      </div>
    </section>

  </main>

  <!-- Modal: Email Preview / Custom Pitch -->
  <div id="emailModal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 z-50">
    <div class="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="font-bold text-white text-lg">Send Outreach Pitch</h3>
        <button onclick="closeEmailModal()" class="text-slate-400 hover:text-white">&times;</button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">To</label>
          <input type="email" id="modalRecipient" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Subject</label>
          <input type="text" id="modalSubject" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white font-medium">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Message Body</label>
          <textarea id="modalBody" rows="10" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-slate-200 font-mono"></textarea>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2">
        <span class="text-xs text-slate-500">Sending via Hostinger SMTP (<code>ayub@webpenter.com</code>)</span>
        <div class="flex gap-2">
          <button onclick="closeEmailModal()" class="px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
          <button onclick="sendPreparedEmail()" id="modalSendBtn" class="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-sm">
            <i class="fa-solid fa-paper-plane mr-1"></i> Send Email
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Tab Switching
    function switchTab(tab) {
      ['discovery', 'custom', 'roster', 'outbox', 'settings'].forEach(t => {
        const el = document.getElementById('view-' + t);
        const btn = document.getElementById('tab-' + t);
        if (t === tab) {
          el.classList.remove('hidden');
          btn.classList.add('tab-active');
        } else {
          el.classList.add('hidden');
          btn.classList.remove('tab-active');
        }
      });
      if (tab === 'discovery') loadDiscoveredAgents();
      if (tab === 'roster') loadRoster();
      if (tab === 'outbox') loadOutreachHistory();
    }

    // Logger
    function appendLog(msg) {
      const consoleLog = document.getElementById('consoleLog');
      const row = document.createElement('div');
      row.textContent = msg;
      consoleLog.appendChild(row);
      consoleLog.scrollTop = consoleLog.scrollHeight;
    }
    function clearLogs() {
      document.getElementById('consoleLog').innerHTML = '';
    }

    // 1. Load Discovered Agents
    async function loadDiscoveredAgents() {
      const container = document.getElementById('discoveryList');
      try {
        const res = await fetch('/api/agents/discovered');
        const data = await res.json();
        if (!data.agents || data.agents.length === 0) {
          container.innerHTML = '<div class="p-8 text-center text-slate-500 col-span-3">No agents found. Click "Refresh / Crawl Directory".</div>';
          return;
        }

        container.innerHTML = data.agents.map(a => {
          const isLaunched = a.status === 'launched';
          return \`
            <div class="bg-slate-900 border \${isLaunched ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'} rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-bold text-white text-base">\${a.name}</h3>
                  <span class="text-xs px-2 py-0.5 rounded font-mono \${isLaunched ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'}">
                    \${isLaunched ? '✓ Live Site' : (a.activeListingsCount ? a.activeListingsCount + ' Listings' : 'Discovered')}
                  </span>
                </div>
                <p class="text-xs text-amber-400 font-medium mb-1">\${a.territory || 'Dallas Luxury Advisory'}</p>
                <p class="text-xs text-slate-400"><i class="fa-solid fa-phone mr-1"></i> \${a.phone || 'Phone not listed'}</p>
                <p class="text-xs text-slate-400"><i class="fa-solid fa-envelope mr-1"></i> \${a.email || 'Email not listed'}</p>
                \${a.notes ? \`<p class="text-xs text-slate-500 mt-2 italic">\${a.notes}</p>\` : ''}
              </div>

              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a href="\${a.url}" target="_blank" class="text-xs text-slate-400 hover:text-white underline">Compass Profile</a>
                <div class="flex gap-2">
                  \${isLaunched ? \`
                    <a href="\${a.liveUrl || '/'+a.slug}" target="_blank" class="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-semibold">View Live</a>
                  \` : \`
                    <button onclick="launchFromDiscovery('\${a.slug}', '\${a.url}')" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs">
                      <i class="fa-solid fa-bolt mr-1"></i> 1-Click Launch
                    </button>
                  \`}
                  <button onclick="openEmailForAgent('\${a.name}', '\${a.slug}', '\${a.email}')" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs">
                    <i class="fa-solid fa-envelope"></i>
                  </button>
                </div>
              </div>
            </div>
          \`;
        }).join('');
      } catch (err) {
        container.innerHTML = \`<div class="p-8 text-center text-red-400 col-span-3">Error loading agents: \${err.message}</div>\`;
      }
    }

    // 2. Launch from Discovery
    async function launchFromDiscovery(slug, url) {
      if (!confirm(\`Are you sure you want to scrape, build, and deploy a bespoke portal for '\${slug}'?\`)) return;
      switchTab('custom');
      document.getElementById('customUrl').value = url;
      document.getElementById('customSlug').value = slug;
      document.getElementById('onboardForm').dispatchEvent(new Event('submit'));
    }

    // 3. Custom Onboard Submission
    async function handleCustomOnboard(e) {
      e.preventDefault();
      const url = document.getElementById('customUrl').value.trim();
      const slug = document.getElementById('customSlug').value.trim().toLowerCase();
      const autoRegister = document.getElementById('chkAutoWire').checked;
      const buildAndDeploy = document.getElementById('chkDeploy').checked;
      const sendEmail = document.getElementById('chkSendEmail').checked;

      const btn = document.getElementById('onboardSubmitBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Executing Pipeline...';

      appendLog(\`>>> INITIATING PIPELINE FOR: \${slug} <<<\`);
      try {
        const res = await fetch('/api/agents/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, slug, autoRegister, buildAndDeploy, sendEmail })
        });
        const data = await res.json();
        if (data.logs) {
          data.logs.forEach(l => appendLog(l));
        }

        if (data.success) {
          appendLog(\`SUCCESS! Portal is live at: \${data.result.liveUrl}\`);
          alert(\`Agent '\${data.result.agentName}' successfully onboarded!\\nLive at: \${data.result.liveUrl}\`);
          loadRoster();
        } else {
          appendLog(\`ERROR: \${data.error}\`);
          alert('Error during onboarding: ' + data.error);
        }
      } catch (err) {
        appendLog(\`FATAL ERROR: \${err.message}\`);
        alert('Request failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Launch Autonomous Pipeline';
      }
    }

    // 4. Load Roster
    async function loadRoster() {
      const grid = document.getElementById('rosterGrid');
      try {
        const res = await fetch('/api/agents/roster');
        const data = await res.json();
        document.getElementById('rosterCount').textContent = data.roster.length;
        grid.innerHTML = data.roster.map(r => \`
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between mb-1">
                <h3 class="font-bold text-white text-base">\${r.name}</h3>
                <span class="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">/\${r.id}</span>
              </div>
              <p class="text-xs text-slate-400">\${r.title}</p>
            </div>
            <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <a href="\${r.liveUrl}" target="_blank" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded">
                <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> View Portal
              </a>
              <a href="\${r.manageUrl}" target="_blank" class="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded">
                Manage Console
              </a>
            </div>
          </div>
        \`).join('');
      } catch (e) {
        grid.innerHTML = '<div class="p-6 text-red-400">Failed to load roster.</div>';
      }
    }

    // 5. Load Outreach History
    async function loadOutreachHistory() {
      const tbody = document.getElementById('historyTableBody');
      try {
        const res = await fetch('/api/outreach/history');
        const data = await res.json();
        if (!data.history || data.history.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-500">No emails dispatched yet from this dashboard.</td></tr>';
          return;
        }
        tbody.innerHTML = data.history.map(h => \`
          <tr class="hover:bg-slate-800/40">
            <td class="px-4 py-3 font-medium text-white">\${h.agentName}</td>
            <td class="px-4 py-3 font-mono text-xs text-slate-300">\${h.recipient}</td>
            <td class="px-4 py-3 text-slate-400 text-xs truncate max-w-xs">\${h.subject}</td>
            <td class="px-4 py-3 text-slate-400 text-xs">\${new Date(h.sentAt).toLocaleString()}</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 font-mono">Delivered</span></td>
            <td class="px-4 py-3 text-right">
              <button onclick="openFollowUp('\${h.agentName}', '\${h.recipient}', '\${h.slug}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 rounded">
                Follow Up
              </button>
            </td>
          </tr>
        \`).join('');
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-red-400">Error loading outbox.</td></tr>';
      }
    }

    // 6. Email Modal Functions
    let currentPreparedPayload = {};
    async function openEmailForAgent(name, slug, email) {
      document.getElementById('modalRecipient').value = email || '';
      document.getElementById('emailModal').classList.remove('hidden');

      try {
        const res = await fetch('/api/mailer/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, slug, email })
        });
        const data = await res.json();
        if (data.pitch) {
          document.getElementById('modalSubject').value = data.pitch.subject;
          document.getElementById('modalBody').value = data.pitch.textBody;
          currentPreparedPayload = { name, slug, to: email };
        }
      } catch (e) {}
    }

    function openFollowUp(name, email, slug) {
      document.getElementById('modalRecipient').value = email;
      document.getElementById('modalSubject').value = \`Re: Built a bespoke portal for your Dallas portfolio\`;
      document.getElementById('modalBody').value = \`Hi \${name.split(' ')[0]},\\n\\nJust wanted to make sure this didn't get buried under your MLS alerts!\\n\\nHere's the live link to your modern portfolio with $0 monthly hosting:\\nhttps://realestate-advisory.ayubkhokhar786.workers.dev/\${slug}\\n\\nLet me know if you would like me to connect this to your custom domain this week.\\n\\nBest regards,\\nAyub Khokhar\\nWebpenter Real Estate Advisory\\nayub@webpenter.com\`;
      document.getElementById('emailModal').classList.remove('hidden');
    }

    function closeEmailModal() {
      document.getElementById('emailModal').classList.add('hidden');
    }

    async function sendPreparedEmail() {
      const to = document.getElementById('modalRecipient').value.trim();
      const subject = document.getElementById('modalSubject').value.trim();
      const customBody = document.getElementById('modalBody').value.trim();
      if (!to || !subject || !customBody) return alert('Please fill in recipient, subject, and body.');

      const btn = document.getElementById('modalSendBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Sending...';

      try {
        const res = await fetch('/api/mailer/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            customSubject: subject,
            customBody,
            name: currentPreparedPayload.name || to,
            slug: currentPreparedPayload.slug || 'portal'
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Email sent successfully via Hostinger SMTP!');
          closeEmailModal();
          loadOutreachHistory();
        } else {
          alert('Failed to send email: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Request error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane mr-1"></i> Send Email';
      }
    }

    // 7. Settings & SMTP Test
    async function testSmtpConnection() {
      const badge = document.getElementById('smtpBadge');
      badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-yellow-400 animate-spin"></span> Testing connection...';
      try {
        const res = await fetch('/api/mailer/test', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500"></span> Hostinger SMTP: <strong class="text-white">Active (ayub@webpenter.com)</strong>';
          alert('Success: ' + data.message);
        } else {
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> Hostinger SMTP: <strong class="text-red-400">Offline</strong>';
          alert('Hostinger Connection Failed: ' + data.error + '\\nPlease update your email password in the Settings tab.');
          switchTab('settings');
        }
      } catch (err) {
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> Hostinger SMTP Error';
        alert('Test failed: ' + err.message);
      }
    }

    async function handleSaveSettings(e) {
      e.preventDefault();
      const host = document.getElementById('smtpHost').value.trim();
      const port = document.getElementById('smtpPort').value.trim();
      const user = document.getElementById('smtpUser').value.trim();
      const pass = document.getElementById('smtpPass').value;
      const senderName = document.getElementById('smtpSenderName').value.trim();

      try {
        const res = await fetch('/api/mailer/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ host, port, user, pass, senderName })
        });
        const data = await res.json();
        if (data.success) {
          alert('Settings saved!');
          testSmtpConnection();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        alert('Failed to save settings: ' + err.message);
      }
    }

    // Initial Load
    loadDiscoveredAgents();
    loadRoster();
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Dallas Real Estate Outreach Control Suite is LIVE!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Email Engine: ayub@webpenter.com via Hostinger SMTP`);
  console.log(`Zero AI tokens required.`);
  console.log(`======================================================\n`);
});
