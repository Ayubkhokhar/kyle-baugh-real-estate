// scripts/crm-manager.js
// Client Relationship Management & Follow-up State Tracker
// Zero AI token cost, 100% persistent local database.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDiscoveredAgents, saveDiscoveredAgents } from "./agent-discovery.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const templatesPath = path.join(rootDir, "config", "outreach-templates.json");
const historyPath = path.join(rootDir, "data", "outreach-history.json");

export function getTemplates() {
  if (fs.existsSync(templatesPath)) {
    try {
      return JSON.parse(fs.readFileSync(templatesPath, "utf-8"));
    } catch (e) {}
  }
  return {
    initial: {
      name: "Initial Showcase Pitch",
      subject: "{ActiveListing} + your Dallas portfolio (Built this for you)",
      body: "Hi {FirstName},\n\nI noticed you’ve been doing strong numbers across Dallas ({FlagshipSale}), but your digital presence is still tied to the generic corporate brokerage layout.\n\nWhen high-net-worth buyers and sellers look you up, you deserve an ultra-fast, bespoke architectural portal that reflects your luxury standard.\n\nI built a live, working concept for your brand featuring {ActiveListing} and {TotalDeals} past sales:\n\n👉 Your Live Portal: {LiveUrl}\n\nWhy this beats standard websites:\n1. $0 / month hosting forever: Hosted on Cloudflare's global edge network, meaning you never pay monthly hosting or server maintenance retainers.\n2. 60-Second Self-Serve Console: Upload new off-market or active listings from your phone in under 60 seconds with no web developer required.\n\n👉 Try your private listing console here:\n{ManageUrl}\n(Passcode: admin123)\n\nIf you like the aesthetic, I can hand over the keys and connect it to your custom domain this week.\n\nBest regards,\nAyub Khokhar\nWebpenter Real Estate Advisory\nayub@webpenter.com"
    },
    followup_ignored: {
      name: "Follow-Up #1: Ignored / No Response",
      subject: "Re: {ActiveListing} (Did you get a chance to see this?)",
      body: "Hi {FirstName},\n\nQuick follow-up on the modern digital portal I built for your Dallas portfolio:\n👉 {LiveUrl}\n\nI know your inbox gets flooded with MLS alerts and client inquiries, so I wanted to make sure this didn't get buried.\n\nKey advantages recap:\n- $0 / month hosting forever: Hosted on Cloudflare Edge, meaning zero monthly server or maintenance retainers.\n- 60-Second Self-Serve Console: Upload pocket or active listings straight from your phone ({ManageUrl} - Passcode: admin123)\n\nWould you be open to a 2-minute chat this week to hand over the administrative keys and connect it to your custom domain?\n\nBest regards,\nAyub Khokhar\nWebpenter Real Estate Advisory\nayub@webpenter.com"
    },
    followup_silent: {
      name: "Follow-Up #2: Replied Initially but Went Silent",
      subject: "Re: Next steps for {FirstName}'s custom Dallas showcase",
      body: "Hi {FirstName},\n\nFollowing up on our earlier note regarding your bespoke showcase ({LiveUrl}).\n\nI understand you're busy closing transactions, so I wanted to check in and see if you had any questions on:\n1. Handing over the private listing console keys to you and your team\n2. Connecting your custom domain while keeping monthly hosting at $0 forever\n3. Uploading any upcoming off-market or pocket listings\n\nIf you'd like, I can transfer full control to you today so you can test it directly on your mobile.\n\nLet me know what works best for your schedule!\n\nBest regards,\nAyub Khokhar\nWebpenter Real Estate Advisory\nayub@webpenter.com"
    }
  };
}

export function saveTemplates(newTemplates) {
  fs.writeFileSync(templatesPath, JSON.stringify(newTemplates, null, 2), "utf-8");
  return { success: true, message: "Templates updated successfully" };
}

export function renderTemplate(templateKey, agentData) {
  const templates = getTemplates();
  const tmpl = templates[templateKey] || templates.initial;

  const firstName = (agentData.name || "").split(" ")[0] || "there";
  const baseUrl = "https://realestate-advisory.ayubkhokhar786.workers.dev";
  const slug = agentData.slug || "portal";
  const liveUrl = `${baseUrl}/${slug}`;
  const manageUrl = `${baseUrl}/${slug}/manage`;

  let activeListing = agentData.activeListingAddress;
  if (!activeListing && slug) {
    try {
      const camel = slug.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const pFile = slug === "kyle" ? "compassProperties.js" : `${camel}Properties.js`;
      const pPath = slug === "kyle"
        ? path.join(rootDir, "src", "data", pFile)
        : path.join(rootDir, "src", "data", "agents", pFile);
      if (fs.existsSync(pPath)) {
        const pContent = fs.readFileSync(pPath, "utf-8");
        const matchAddr = pContent.match(/address:\s*["']([^,"']+)/i);
        if (matchAddr) activeListing = matchAddr[1].trim();
      }
    } catch (e) {}
  }
  if (!activeListing) {
    activeListing = agentData.name ? `${agentData.name}'s portfolio` : "your Dallas portfolio";
  }

  const flagshipSale = agentData.topSoldAddress
    ? `flagship sale at ${agentData.topSoldAddress}`
    : "your impressive past production";

  const totalDeals = agentData.totalDeals || agentData.activeListingsCount || "30+";

  const replacements = {
    "{FirstName}": firstName,
    "{Name}": agentData.name || "Real Estate Advisor",
    "{ActiveListing}": activeListing,
    "{FlagshipSale}": flagshipSale,
    "{TotalDeals}": `${totalDeals}`,
    "{LiveUrl}": liveUrl,
    "{ManageUrl}": manageUrl,
  };

  let subject = tmpl.subject;
  let body = tmpl.body;

  for (const [placeholder, val] of Object.entries(replacements)) {
    subject = subject.replaceAll(placeholder, val);
    body = body.replaceAll(placeholder, val);
  }

  return {
    templateKey,
    templateName: tmpl.name,
    subject,
    textBody: body,
    htmlBody: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6; padding: 20px;">${body.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</div>`
  };
}

export function recordAgentContact({
  slug,
  email,
  name,
  stage = "initial_sent", // "initial_sent", "followup_ignored", "followup_silent"
  subject,
}) {
  const agents = getDiscoveredAgents();
  const match = agents.find((a) => a.slug === slug || (email && a.email && a.email.toLowerCase() === email.toLowerCase()));

  const now = new Date().toISOString();
  if (match) {
    match.status = "contacted";
    match.contactStage = stage;
    match.contactCount = (match.contactCount || 0) + 1;
    match.lastContactedAt = now;
    match.lastSubject = subject;
    if (!match.history) match.history = [];
    match.history.push({ stage, subject, sentAt: now });
    saveDiscoveredAgents(agents);
  } else {
    // If agent wasn't in discovery list (e.g. kyle, amy, carson, alex, summer, jd)
    agents.push({
      slug: slug || "custom",
      name: name || email,
      email,
      status: "contacted",
      contactStage: stage,
      contactCount: 1,
      lastContactedAt: now,
      lastSubject: subject,
      history: [{ stage, subject, sentAt: now }],
    });
    saveDiscoveredAgents(agents);
  }

  return { success: true, timestamp: now };
}

export function setAgentStatus(slug, { status, contactStage, notes }) {
  const agents = getDiscoveredAgents();
  const match = agents.find((a) => a.slug === slug);
  if (!match) return { success: false, error: "Agent not found" };

  if (status !== undefined) match.status = status;
  if (contactStage !== undefined) match.contactStage = contactStage;
  if (notes !== undefined) match.notes = notes;

  saveDiscoveredAgents(agents);
  return { success: true, agent: match };
}
