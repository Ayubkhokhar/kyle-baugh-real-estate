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
import { getGroqApiKey, saveGroqApiKey, testGroqKey, generateAIPitch } from "./groq-generator.js";
import { getTemplates, saveTemplates, renderTemplate, setAgentStatus } from "./crm-manager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const historyPath = path.join(rootDir, "data", "outreach-history.json");

const app = express();
const PORT = process.env.SCOUT_PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable browser caching so UI updates immediately
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

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

app.post("/api/mailer/preview", async (req, res) => {
  try {
    const pitch = await generateAIPitch(req.body);
    res.json({ success: true, pitch });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 4b. API: GROQ AI GENERATION & CONFIGURATION
app.get("/api/groq/settings", (req, res) => {
  const key = getGroqApiKey();
  res.json({
    success: true,
    hasKey: Boolean(key),
    maskedKey: key ? `${key.slice(0, 7)}...${key.slice(-4)}` : "",
  });
});

app.post("/api/groq/settings", (req, res) => {
  try {
    const { apiKey } = req.body;
    saveGroqApiKey(apiKey);
    res.json({ success: true, message: "Groq API key saved successfully!" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/groq/test", async (req, res) => {
  const { apiKey } = req.body;
  const result = await testGroqKey(apiKey);
  res.json(result);
});

app.post("/api/mailer/generate-ai", async (req, res) => {
  try {
    const pitch = await generateAIPitch(req.body);
    res.json({ success: true, pitch });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 4c. API: CRM LIFECYCLE & FOLLOW-UP TEMPLATES
app.get("/api/crm/templates", (req, res) => {
  try {
    const templates = getTemplates();
    res.json({ success: true, templates });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/crm/templates", (req, res) => {
  try {
    const result = saveTemplates(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/crm/render", (req, res) => {
  try {
    const { templateKey, agentData } = req.body;
    const rendered = renderTemplate(templateKey, agentData);
    res.json({ success: true, rendered });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/crm/status", (req, res) => {
  try {
    const { slug, status, contactStage, notes } = req.body;
    const result = setAgentStatus(slug, { status, contactStage, notes });
    res.json(result);
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

// 5. EMBEDDED DASHBOARD HTML UI (Catch-all fallback)
app.use((req, res) => {
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

      <div class="flex items-center gap-3 text-sm">
        <div id="smtpBadge" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>SMTP: <strong class="text-white">ayub@webpenter.com</strong></span>
        </div>
        <div id="headerGroqBadge" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
          <i class="fa-solid fa-brain text-amber-400"></i>
          <span>Groq AI: <strong id="headerGroqStatus" class="text-slate-400">Checking...</strong></span>
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
        <i class="fa-solid fa-gear mr-2"></i> Settings (Hostinger & Groq AI)
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

      <!-- CRM Lifecycle Filter Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <span class="text-slate-500 font-semibold mr-2 uppercase tracking-wider">Filter:</span>
        <button onclick="filterAgents('all')" id="filter-all" class="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold transition">
          All (<span id="countAll">0</span>)
        </button>
        <button onclick="filterAgents('new')" id="filter-new" class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white transition">
          🟢 New / Uncontacted (<span id="countNew">0</span>)
        </button>
        <button onclick="filterAgents('contacted')" id="filter-contacted" class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white transition">
          ✓ Contacted (<span id="countContacted">0</span>)
        </button>
        <button onclick="filterAgents('replied')" id="filter-replied" class="px-3 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white transition">
          💬 Replied (<span id="countReplied">0</span>)
        </button>
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
              <input type="url" id="customUrl" required placeholder="https://www.compass.com/agents/liz-chalfant/" 
                class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 font-mono text-sm">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">URL Slug (e.g. liz-chalfant)</label>
              <input type="text" id="customSlug" required placeholder="liz-chalfant" 
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

    <!-- TAB 5: SETTINGS & TEMPLATES -->
    <section id="view-settings" class="hidden space-y-6">

      <!-- Hostinger SMTP Configuration Card -->
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

      <!-- Groq AI Configuration Card -->
      <div class="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-brain text-amber-400"></i> Groq AI Email Generator (Llama 3.3 70B)
          </h2>
          <span id="groqBadge" class="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
            Checking...
          </span>
        </div>
        <p class="text-sm text-slate-400 mb-6">Generates hyper-personalized cold outreach emails tailored to the agent's real listings, flagship sales, and territory in under 1 second.</p>

        <form onsubmit="handleSaveGroqSettings(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Groq API Key</label>
            <input type="password" id="groqApiKey" placeholder="gsk_..." class="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm">
            <p class="text-xs text-slate-500 mt-1">Get your free API key at <a href="https://console.groq.com/keys" target="_blank" class="text-amber-400 underline">console.groq.com/keys</a></p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button type="submit" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition">
              Save Groq Key
            </button>
            <button type="button" onclick="testGroqConnection()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm rounded-lg transition">
              Test Groq API
            </button>
          </div>
        </form>
      </div>

      <!-- Editable Follow-Up Templates Card -->
      <div class="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-xl font-bold text-white mb-1">
          <i class="fa-solid fa-envelope-open-text text-amber-400 mr-2"></i> Outreach & Follow-Up Templates
        </h2>
        <p class="text-sm text-slate-400 mb-6">Customize the default email copy for each contact stage. Dynamic tags available: <code>{FirstName}</code>, <code>{ActiveListing}</code>, <code>{FlagshipSale}</code>, <code>{TotalDeals}</code>, <code>{LiveUrl}</code>, <code>{ManageUrl}</code>.</p>

        <form onsubmit="handleSaveTemplates(event)" class="space-y-6">
          <!-- Template 1: Initial -->
          <div class="border border-slate-800 rounded-lg p-4 bg-slate-950">
            <h3 class="text-sm font-bold text-amber-400 mb-2">1. Initial Showcase Pitch</h3>
            <div class="space-y-2">
              <input type="text" id="tmpl_initial_sub" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white" placeholder="Subject">
              <textarea id="tmpl_initial_body" rows="6" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono"></textarea>
            </div>
          </div>

          <!-- Template 2: Followup Ignored -->
          <div class="border border-slate-800 rounded-lg p-4 bg-slate-950">
            <h3 class="text-sm font-bold text-blue-400 mb-2">2. Follow-Up #1: Ignored / No Response Yet</h3>
            <div class="space-y-2">
              <input type="text" id="tmpl_ignored_sub" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white" placeholder="Subject">
              <textarea id="tmpl_ignored_body" rows="6" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono"></textarea>
            </div>
          </div>

          <!-- Template 3: Followup Silent -->
          <div class="border border-slate-800 rounded-lg p-4 bg-slate-950">
            <h3 class="text-sm font-bold text-purple-400 mb-2">3. Follow-Up #2: Replied Initially but Went Silent</h3>
            <div class="space-y-2">
              <input type="text" id="tmpl_silent_sub" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white" placeholder="Subject">
              <textarea id="tmpl_silent_body" rows="6" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 font-mono"></textarea>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition">
              <i class="fa-solid fa-save mr-1"></i> Save Custom Templates
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
        <h3 class="font-bold text-white text-lg flex items-center gap-2">
          <i class="fa-solid fa-paper-plane text-amber-400"></i> Outreach Dispatch Console
        </h3>
        <button onclick="closeEmailModal()" class="text-slate-400 hover:text-white">&times;</button>
      </div>

      <!-- Strategy Template Selector -->
      <div>
        <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Outreach Stage & Strategy Template</label>
        <select id="modalTemplateSelect" onchange="handleModalTemplateChange()" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-amber-400 font-medium focus:outline-none focus:border-amber-500">
          <option value="initial">1. Initial Showcase Pitch</option>
          <option value="followup_ignored">2. Follow-Up #1: Ignored / No Response</option>
          <option value="followup_silent">3. Follow-Up #2: Replied Initially but Went Silent</option>
        </select>
      </div>

      <!-- Groq AI Rewrite Toolbar -->
      <div class="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Groq AI Tone:
          </span>
          <select id="modalAITone" class="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none">
            <option value="High-End Luxury & Direct">High-End Luxury & Direct</option>
            <option value="Short & Punchy (<120 words)">Short & Punchy (&lt;120 words)</option>
            <option value="Warm & Advisory">Warm & Advisory</option>
            <option value="Aggressive Value Proposition">Aggressive Value Proposition</option>
          </select>
        </div>
        <button type="button" onclick="rewriteWithGroqAI()" id="groqRewriteBtn" class="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-semibold text-xs rounded transition flex items-center gap-1.5">
          <i class="fa-solid fa-bolt"></i> <span>Regenerate with Groq AI</span>
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Recipient</label>
          <input type="email" id="modalRecipient" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white font-mono">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Subject (Editable)</label>
          <input type="text" id="modalSubject" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-white font-medium">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Email Body (Editable)</label>
          <textarea id="modalBody" rows="9" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-sm text-slate-200 font-mono"></textarea>
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
    let rawAgentsList = [];
    let activeFilter = 'all';
    let currentPreparedPayload = {};
    let cachedTemplates = {};

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
      if (tab === 'settings') loadCrmTemplates();
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

    // Filter agents
    function filterAgents(type) {
      activeFilter = type;
      ['all', 'new', 'contacted', 'replied'].forEach(f => {
        const btn = document.getElementById('filter-' + f);
        if (f === type) {
          btn.className = 'px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold transition';
        } else {
          btn.className = 'px-3 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white transition';
        }
      });
      renderAgentsGrid();
    }

    // 1. Load Discovered Agents
    async function loadDiscoveredAgents() {
      try {
        const res = await fetch('/api/agents/discovered');
        const data = await res.json();
        rawAgentsList = data.agents || [];
        updateFilterCounts();
        renderAgentsGrid();
      } catch (err) {
        document.getElementById('discoveryList').innerHTML = \`<div class="p-8 text-center text-red-400 col-span-3">Error loading agents: \${err.message}</div>\`;
      }
    }

    function updateFilterCounts() {
      const total = rawAgentsList.length;
      const contacted = rawAgentsList.filter(a => a.status === 'contacted' || a.contactCount > 0).length;
      const replied = rawAgentsList.filter(a => a.status === 'replied').length;
      const newLeads = rawAgentsList.filter(a => a.status !== 'contacted' && a.status !== 'replied' && !a.contactCount).length;

      document.getElementById('countAll').textContent = total;
      document.getElementById('countNew').textContent = newLeads;
      document.getElementById('countContacted').textContent = contacted;
      document.getElementById('countReplied').textContent = replied;
    }

    function renderAgentsGrid() {
      const container = document.getElementById('discoveryList');
      let filtered = rawAgentsList;

      if (activeFilter === 'new') {
        filtered = rawAgentsList.filter(a => a.status !== 'contacted' && a.status !== 'replied' && !a.contactCount);
      } else if (activeFilter === 'contacted') {
        filtered = rawAgentsList.filter(a => a.status === 'contacted' || a.contactCount > 0);
      } else if (activeFilter === 'replied') {
        filtered = rawAgentsList.filter(a => a.status === 'replied');
      }

      if (filtered.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-slate-500 col-span-3">No agents found in this category.</div>';
        return;
      }

      container.innerHTML = filtered.map(a => {
        const isContacted = a.status === 'contacted' || Boolean(a.contactCount);
        const isReplied = a.status === 'replied';
        const isLaunched = a.status === 'launched' || isContacted;
        const lastDateStr = a.lastContactedAt ? new Date(a.lastContactedAt).toLocaleDateString() : '';

        return \`
          <div class="bg-slate-900 border \${isReplied ? 'border-purple-500/50 bg-purple-500/5' : (isContacted ? 'border-blue-500/40 bg-blue-500/5' : (isLaunched ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800'))} rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-white text-base">\${a.name}</h3>
                <div>
                  \${isReplied ? \`
                    <span class="text-xs px-2 py-0.5 rounded font-mono bg-purple-500/20 text-purple-300">💬 Replied</span>
                  \` : (isContacted ? \`
                    <span class="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300">✓ Contacted (\${lastDateStr})</span>
                  \` : \`
                    <span class="text-xs px-2 py-0.5 rounded font-mono \${isLaunched ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}">
                      \${isLaunched ? 'Ready to Pitch' : (a.activeListingsCount ? a.activeListingsCount + ' Listings' : 'New Lead')}
                    </span>
                  \`)}
                </div>
              </div>

              <p class="text-xs text-amber-400 font-medium mb-1">\${a.territory || 'Dallas Luxury Advisory'}</p>
              <p class="text-xs text-slate-400"><i class="fa-solid fa-phone mr-1"></i> \${a.phone || 'Phone not listed'}</p>
              <p class="text-xs text-slate-400"><i class="fa-solid fa-envelope mr-1"></i> \${a.email || 'Email not listed'}</p>
              \${a.lastSubject ? \`<p class="text-xs text-slate-400 mt-2 bg-slate-950/60 p-2 rounded truncate"><i class="fa-solid fa-paper-plane mr-1 text-slate-500"></i> \${a.lastSubject}</p>\` : ''}
            </div>

            <div class="pt-3 border-t border-slate-800/80 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <a href="\${a.url}" target="_blank" class="text-slate-400 hover:text-white underline">Compass Profile</a>
                <a href="\${a.liveUrl || 'https://realestate-advisory.ayubkhokhar786.workers.dev/' + a.slug}" target="_blank" class="text-amber-400 hover:underline font-mono">View Showcase &rarr;</a>
              </div>

              \${isContacted ? \`
                <!-- Follow-Up Action Controls -->
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <button onclick="openEmailForAgent('\${a.name}', '\${a.slug}', '\${a.email}', 'followup_ignored')" class="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 font-semibold rounded text-xs text-center transition">
                    🔄 Follow-Up #1 (Ignored)
                  </button>
                  <button onclick="openEmailForAgent('\${a.name}', '\${a.slug}', '\${a.email}', 'followup_silent')" class="px-2.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-300 font-semibold rounded text-xs text-center transition">
                    💬 Follow-Up #2 (Silent)
                  </button>
                </div>
                <div class="flex justify-between items-center pt-1 text-xs">
                  <span class="text-slate-500">Status:</span>
                  <select onchange="changeAgentStatus('\${a.slug}', this.value)" class="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300">
                    <option value="contacted" \${a.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="replied" \${a.status === 'replied' ? 'selected' : ''}>Replied / Interested</option>
                    <option value="new" \${a.status === 'new' ? 'selected' : ''}>Reset to New</option>
                  </select>
                </div>
              \` : \`
                <!-- Uncontacted Controls -->
                <div class="flex justify-between items-center gap-2 pt-1">
                  <button onclick="launchFromDiscovery('\${a.slug}', '\${a.url}')" class="flex-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs text-center">
                    <i class="fa-solid fa-bolt mr-1"></i> 1-Click Launch
                  </button>
                  <button onclick="openEmailForAgent('\${a.name}', '\${a.slug}', '\${a.email}', 'initial')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs">
                    <i class="fa-solid fa-envelope mr-1"></i> Pitch
                  </button>
                </div>
              \`}
            </div>
          </div>
        \`;
      }).join('');
    }

    // Status changer
    async function changeAgentStatus(slug, newStatus) {
      try {
        await fetch('/api/crm/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, status: newStatus })
        });
        loadDiscoveredAgents();
      } catch (e) {
        alert('Failed to update status: ' + e.message);
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
          loadDiscoveredAgents();
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
              <button onclick="openEmailForAgent('\${h.agentName}', '\${h.slug}', '\${h.recipient}', 'followup_ignored')" class="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 text-xs font-semibold rounded">
                Follow Up
              </button>
            </td>
          </tr>
        \`).join('');
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-red-400">Error loading outbox.</td></tr>';
      }
    }

    // 6. Email Modal & Follow-Up Functions
    async function openEmailForAgent(name, slug, email, templateKey = 'initial') {
      currentPreparedPayload = { name, slug, to: email, templateKey };
      document.getElementById('modalRecipient').value = email || '';
      document.getElementById('modalTemplateSelect').value = templateKey;
      document.getElementById('emailModal').classList.remove('hidden');

      loadTemplateIntoModal(templateKey);
    }

    async function loadTemplateIntoModal(templateKey) {
      try {
        const res = await fetch('/api/crm/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateKey,
            agentData: {
              name: currentPreparedPayload.name,
              slug: currentPreparedPayload.slug,
              email: document.getElementById('modalRecipient').value,
            }
          })
        });
        const data = await res.json();
        if (data.rendered) {
          document.getElementById('modalSubject').value = data.rendered.subject;
          document.getElementById('modalBody').value = data.rendered.textBody;
        }
      } catch (e) {
        console.error('Failed to render template:', e);
      }
    }

    function handleModalTemplateChange() {
      const selected = document.getElementById('modalTemplateSelect').value;
      currentPreparedPayload.templateKey = selected;
      loadTemplateIntoModal(selected);
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
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Sending via Hostinger...';

      try {
        const res = await fetch('/api/mailer/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to,
            customSubject: subject,
            customBody,
            name: currentPreparedPayload.name || to,
            slug: currentPreparedPayload.slug || 'portal',
            stage: currentPreparedPayload.templateKey || 'initial_sent'
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Email sent successfully via Hostinger SMTP!');
          closeEmailModal();
          loadOutreachHistory();
          loadDiscoveredAgents(); // Refreshes CRM status to Contacted
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
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-green-500"></span> SMTP: <strong class="text-white">Active (ayub@webpenter.com)</strong>';
          alert('Success: ' + data.message);
        } else {
          badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> SMTP: <strong class="text-red-400">Offline</strong>';
          alert('Hostinger Connection Failed: ' + data.error + '\\nPlease update your email password in the Settings tab.');
          switchTab('settings');
        }
      } catch (err) {
        badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-red-500"></span> SMTP Error';
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

    // 8. Groq AI Integration Functions
    async function loadGroqSettings() {
      const badge = document.getElementById('groqBadge');
      const headerStatus = document.getElementById('headerGroqStatus');
      const keyInput = document.getElementById('groqApiKey');
      try {
        const res = await fetch('/api/groq/settings');
        const data = await res.json();
        if (data.hasKey) {
          if (badge) {
            badge.className = 'text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-mono';
            badge.textContent = '✓ Active (' + data.maskedKey + ')';
          }
          if (headerStatus) {
            headerStatus.innerHTML = '<span class="text-green-400 font-medium">Llama 3.3 Active</span>';
          }
          if (keyInput) {
            keyInput.placeholder = 'Configured in .env (' + data.maskedKey + ') - enter new key to replace';
          }
        } else {
          if (badge) {
            badge.className = 'text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400';
            badge.textContent = 'Not Configured';
          }
          if (headerStatus) {
            headerStatus.innerHTML = '<span class="text-slate-400">Not Configured</span>';
          }
        }
      } catch (e) {}
    }

    async function handleSaveGroqSettings(e) {
      e.preventDefault();
      const apiKey = document.getElementById('groqApiKey').value.trim();
      if (!apiKey) return alert('Please enter your Groq API key.');

      try {
        const res = await fetch('/api/groq/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey })
        });
        const data = await res.json();
        if (data.success) {
          alert('Groq API key saved!');
          testGroqConnection();
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        alert('Failed: ' + err.message);
      }
    }

    async function testGroqConnection() {
      const badge = document.getElementById('groqBadge');
      badge.textContent = 'Testing API...';
      const apiKey = document.getElementById('groqApiKey').value.trim();

      try {
        const res = await fetch('/api/groq/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey })
        });
        const data = await res.json();
        if (data.success) {
          badge.className = 'text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-mono';
          badge.textContent = '✓ Llama 3.3 70B Active';
          alert('Groq Success: ' + data.message);
        } else {
          badge.className = 'text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 font-mono';
          badge.textContent = 'Error: Invalid Key';
          alert('Groq Error: ' + data.error);
        }
      } catch (err) {
        alert('Connection error: ' + err.message);
      }
    }

    async function rewriteWithGroqAI() {
      const tone = document.getElementById('modalAITone').value;
      const btn = document.getElementById('groqRewriteBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Generating...';

      try {
        const res = await fetch('/api/mailer/generate-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentPreparedPayload.name || 'Advisor',
            slug: currentPreparedPayload.slug || 'portal',
            email: document.getElementById('modalRecipient').value,
            tone: tone,
            customNotes: 'Follow-up strategy stage: ' + (currentPreparedPayload.templateKey || 'initial')
          })
        });
        const data = await res.json();
        if (data.pitch) {
          document.getElementById('modalSubject').value = data.pitch.subject;
          document.getElementById('modalBody').value = data.pitch.textBody;
        } else {
          alert('Failed to generate pitch: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('AI generation error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-bolt mr-1"></i> <span>Regenerate with Groq AI</span>';
      }
    }

    // 9. Load & Save CRM Templates
    async function loadCrmTemplates() {
      try {
        const res = await fetch('/api/crm/templates');
        const data = await res.json();
        if (data.templates) {
          cachedTemplates = data.templates;
          document.getElementById('tmpl_initial_sub').value = data.templates.initial?.subject || '';
          document.getElementById('tmpl_initial_body').value = data.templates.initial?.body || '';

          document.getElementById('tmpl_ignored_sub').value = data.templates.followup_ignored?.subject || '';
          document.getElementById('tmpl_ignored_body').value = data.templates.followup_ignored?.body || '';

          document.getElementById('tmpl_silent_sub').value = data.templates.followup_silent?.subject || '';
          document.getElementById('tmpl_silent_body').value = data.templates.followup_silent?.body || '';
        }
      } catch (e) {
        console.error('Failed to load templates:', e);
      }
    }

    async function handleSaveTemplates(e) {
      e.preventDefault();
      const updated = {
        initial: {
          name: "Initial Showcase Pitch",
          subject: document.getElementById('tmpl_initial_sub').value,
          body: document.getElementById('tmpl_initial_body').value
        },
        followup_ignored: {
          name: "Follow-Up #1: Ignored / No Response",
          subject: document.getElementById('tmpl_ignored_sub').value,
          body: document.getElementById('tmpl_ignored_body').value
        },
        followup_silent: {
          name: "Follow-Up #2: Replied Initially but Went Silent",
          subject: document.getElementById('tmpl_silent_sub').value,
          body: document.getElementById('tmpl_silent_body').value
        }
      };

      try {
        const res = await fetch('/api/crm/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        const data = await res.json();
        if (data.success) {
          alert('Custom templates saved successfully!');
          cachedTemplates = updated;
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        alert('Failed to save templates: ' + err.message);
      }
    }

    // Initial Load
    loadDiscoveredAgents();
    loadRoster();
    loadGroqSettings();
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
