// scripts/hostinger-mailer.js
// Direct Hostinger SMTP integration for ayub@webpenter.com
// Zero third-party fees, full SPF/DKIM authentication.

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { recordAgentContact } from "./crm-manager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const configPath = path.join(rootDir, "config", "mailer-settings.json");
const trackerPath = path.join(rootDir, "data", "outreach-history.json");

// Ensure directories exist
if (!fs.existsSync(path.join(rootDir, "config"))) {
  fs.mkdirSync(path.join(rootDir, "config"), { recursive: true });
}
if (!fs.existsSync(path.join(rootDir, "data"))) {
  fs.mkdirSync(path.join(rootDir, "data"), { recursive: true });
}
if (!fs.existsSync(trackerPath)) {
  fs.writeFileSync(trackerPath, JSON.stringify([], null, 2), "utf-8");
}

dotenv.config({ path: envPath });

export function getMailerConfig() {
  let fileConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {}
  }

  return {
    host: process.env.HOSTINGER_SMTP_HOST || fileConfig.host || "smtp.hostinger.com",
    port: Number(process.env.HOSTINGER_SMTP_PORT || fileConfig.port || 465),
    secure: (process.env.HOSTINGER_SMTP_SECURE || fileConfig.secure || "true") === "true",
    user: process.env.HOSTINGER_EMAIL || fileConfig.user || "ayub@webpenter.com",
    pass: process.env.HOSTINGER_PASSWORD || fileConfig.pass || "",
    senderName: fileConfig.senderName || "Ayub Khokhar | Webpenter Real Estate Advisory",
    replyTo: fileConfig.replyTo || "ayub@webpenter.com",
  };
}

export function saveMailerConfig(newConfig) {
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), "utf-8");
  return { success: true, message: "Mailer settings saved successfully" };
}

export function createTransporter() {
  const cfg = getMailerConfig();
  if (!cfg.pass) {
    throw new Error("Hostinger email password is not configured yet. Set HOSTINGER_PASSWORD in .env or via the control dashboard.");
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure, // true for 465, false for other ports
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
}

export async function testConnection() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: "Hostinger SMTP connected and authenticated successfully!" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function generatePitch({
  name,
  slug,
  email,
  activeListingAddress,
  activeListingPrice,
  topSoldAddress,
  topSoldPrice,
  totalDeals = 30,
}) {
  const firstName = name.split(" ")[0] || name;
  const baseUrl = "https://realestate-advisory.ayubkhokhar786.workers.dev";
  const liveUrl = `${baseUrl}/${slug}`;
  const manageUrl = `${baseUrl}/${slug}/manage`;

  const activeMention = activeListingAddress
    ? `featuring ${activeListingAddress}${activeListingPrice ? ` ($${Number(activeListingPrice).toLocaleString()})` : ""}`
    : "highlighting your luxury portfolio";

  const flagshipMention = topSoldAddress
    ? `your flagship sale at ${topSoldAddress}${topSoldPrice ? ` ($${Number(topSoldPrice).toLocaleString()})` : ""}`
    : "your impressive past production";

  const subject = activeListingAddress
    ? `${activeListingAddress.split(",")[0]} + your Dallas portfolio (Built this for you)`
    : `${firstName} - Built a bespoke Dallas digital showcase for your portfolio`;

  const textBody = `Hi ${firstName},

I noticed you’ve been doing strong numbers across Dallas (${flagshipMention}), but your digital presence is still tied to the generic corporate brokerage layout.

When high-net-worth buyers and sellers look you up, you deserve an ultra-fast, bespoke architectural portal that reflects your luxury standard.

I built a live, working concept for your brand ${activeMention} and ${totalDeals} past sales:

👉 Your Live Portal: ${liveUrl}

Why this beats standard websites:
1. $0 / month hosting forever: Hosted on Cloudflare's global edge network, meaning you never pay monthly hosting or server maintenance retainers.
2. 60-Second Self-Serve Console: Upload new off-market or active listings from your phone in under 60 seconds with no web developer required.

👉 Try your private listing console here:
${manageUrl}
(Passcode: admin123)

If you like the aesthetic, I can hand over the keys and connect it to your custom domain this week.

Best regards,
Ayub Khokhar
Webpenter Real Estate Advisory
ayub@webpenter.com
`;

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6; padding: 20px;">
  <p>Hi ${firstName},</p>

  <p>I noticed you’ve been doing strong numbers across Dallas (${flagshipMention}), but your digital presence is still tied to the generic corporate brokerage layout.</p>

  <p>When high-net-worth buyers and sellers look you up, you deserve an ultra-fast, bespoke architectural portal that reflects your luxury standard.</p>

  <p>I built a live, working concept for your brand <strong>${activeMention}</strong> and ${totalDeals} past sales:</p>

  <div style="margin: 24px 0;">
    <a href="${liveUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">View Your Live Portal &rarr;</a>
  </div>

  <p><strong>Why this beats standard agent websites:</strong></p>
  <ul style="padding-left: 20px;">
    <li style="margin-bottom: 8px;"><strong>$0 / month hosting forever:</strong> Hosted on Cloudflare's global edge network, meaning you never pay monthly hosting, cloud, or server maintenance retainers.</li>
    <li style="margin-bottom: 8px;"><strong>60-Second Self-Serve Console:</strong> Upload new off-market or pocket listings directly from your phone in under a minute without waiting on a web developer.</li>
  </ul>

  <p>You can test your private listing console here:<br/>
    <a href="${manageUrl}" style="color: #2563eb;">${manageUrl}</a><br/>
    <em>(Temporary Passcode: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">admin123</code>)</em>
  </p>

  <p>If you like the aesthetic, I can hand over the keys and connect it to your custom domain this week.</p>

  <p style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 14px; color: #64748b;">
    <strong>Ayub Khokhar</strong><br/>
    Founder & Lead Architect · <a href="https://webpenter.com" style="color: #64748b;">Webpenter</a><br/>
    <a href="mailto:ayub@webpenter.com" style="color: #2563eb;">ayub@webpenter.com</a>
  </p>
</div>
`;

  return { subject, textBody, htmlBody };
}

export async function sendOutreachEmail({
  to,
  name,
  slug,
  activeListingAddress,
  activeListingPrice,
  topSoldAddress,
  topSoldPrice,
  totalDeals,
  customSubject,
  customBody,
}) {
  const cfg = getMailerConfig();
  const transporter = createTransporter();

  let subject = customSubject;
  let text = customBody;
  let html = customBody ? `<div style="font-family: sans-serif; line-height: 1.6;">${customBody.replace(/\n/g, "<br/>")}</div>` : null;

  if (!subject || !html) {
    const pitch = generatePitch({
      name,
      slug,
      email: to,
      activeListingAddress,
      activeListingPrice,
      topSoldAddress,
      topSoldPrice,
      totalDeals,
    });
    subject = subject || pitch.subject;
    text = text || pitch.textBody;
    html = html || pitch.htmlBody;
  }

  const info = await transporter.sendMail({
    from: `"${cfg.senderName}" <${cfg.user}>`,
    to,
    replyTo: cfg.replyTo,
    subject,
    text,
    html,
  });

  // Record in outreach history
  const historyEntry = {
    id: "outreach-" + Date.now(),
    agentName: name,
    slug,
    recipient: to,
    sender: cfg.user,
    subject,
    sentAt: new Date().toISOString(),
    messageId: info.messageId,
    status: "sent",
    liveUrl: `https://realestate-advisory.ayubkhokhar786.workers.dev/${slug}`,
  };

  try {
    const rawHistory = fs.readFileSync(trackerPath, "utf-8");
    const history = JSON.parse(rawHistory);
    history.unshift(historyEntry);
    fs.writeFileSync(trackerPath, JSON.stringify(history, null, 2), "utf-8");

    // Automatically stamp agent as contacted in CRM
    recordAgentContact({
      slug,
      email: to,
      name,
      stage: customSubject?.toLowerCase().includes("re:") ? "followup_sent" : "initial_sent",
      subject,
    });
  } catch (err) {
    console.error("Failed to append outreach history / CRM record:", err);
  }

  return {
    success: true,
    messageId: info.messageId,
    entry: historyEntry,
  };
}
