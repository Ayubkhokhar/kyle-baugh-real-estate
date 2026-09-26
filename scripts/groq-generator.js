// scripts/groq-generator.js
// Ultra-fast personalized cold outreach generation using Groq LLM API (Llama 3.3 70B)
// Tailored to Dallas luxury real estate agents.

import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { generatePitch } from "./hostinger-mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const configPath = path.join(rootDir, "config", "mailer-settings.json");

dotenv.config({ path: envPath });

export function getGroqApiKey() {
  let fileConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {}
  }
  return process.env.GROQ_API_KEY || fileConfig.groqApiKey || "";
}

export function saveGroqApiKey(apiKey) {
  let fileConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (e) {}
  }
  fileConfig.groqApiKey = apiKey;
  fs.writeFileSync(configPath, JSON.stringify(fileConfig, null, 2), "utf-8");
  return { success: true, message: "Groq API key saved successfully" };
}

export async function testGroqKey(apiKey) {
  const keyToUse = apiKey || getGroqApiKey();
  if (!keyToUse) {
    return { success: false, error: "No Groq API key provided." };
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${keyToUse}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "Reply with the word 'READY' only." }],
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, message: "Groq API key is valid and connected! (Llama 3.3 / 3.1 ready)" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function generateAIPitch({
  name,
  slug,
  email,
  activeListingAddress,
  activeListingPrice,
  topSoldAddress,
  topSoldPrice,
  totalDeals = 30,
  territory = "Dallas",
  tone = "High-End Luxury & Direct",
  customNotes = "",
}) {
  const apiKey = getGroqApiKey();
  const firstName = name.split(" ")[0] || name;
  const baseUrl = "https://realestate-advisory.ayubkhokhar786.workers.dev";
  const liveUrl = `${baseUrl}/${slug}`;
  const manageUrl = `${baseUrl}/${slug}/manage`;

  // Fallback to rule-based template if no API key is set
  if (!apiKey) {
    console.log("[Groq] No API key configured. Using default high-converting template.");
    return generatePitch({
      name,
      slug,
      email,
      activeListingAddress,
      activeListingPrice,
      topSoldAddress,
      topSoldPrice,
      totalDeals,
    });
  }

  const systemPrompt = `You are an elite real estate technology copywriter specializing in ultra-luxury Dallas real estate.
You write hyper-personalized cold outreach emails to top-producing agents.
Your goals:
1. Show you did actual research: mention their exact active listing and their flagship past sales.
2. Emphasize our 2 irresistible USPs:
   a) $0 / month hosting forever (hosted on Cloudflare edge, no monthly tech or server fees, ever).
   b) 60-Second Self-Serve Listing Dashboard to upload pocket/exclusive listings from mobile without a developer.
3. Include their live portal link and private management console link (Passcode: admin123).
4. Tone: ${tone}. Conversational, peer-to-peer, confident, zero fluff, under 160 words. No buzzwords like "delve", "game-changer", "revolutionize".
5. Return ONLY a valid JSON object with two fields:
   "subject": "The email subject line",
   "body": "The plain text email body"`;

  const userPrompt = `Agent Name: ${name} (First Name: ${firstName})
Agent Email: ${email}
Active Listing: ${activeListingAddress ? `${activeListingAddress} ($${Number(activeListingPrice || 0).toLocaleString()})` : "Active portfolio"}
Flagship Past Sale: ${topSoldAddress ? `${topSoldAddress} ($${Number(topSoldPrice || 0).toLocaleString()})` : "Past luxury transactions"}
Total Verified Deals: ${totalDeals}
Market/Territory: ${territory}
Live Showcase URL: ${liveUrl}
Management Console URL: ${manageUrl} (Passcode: admin123)
Sender: Ayub Khokhar, Webpenter Real Estate Advisory (ayub@webpenter.com)
${customNotes ? `Additional Instructions: ${customNotes}` : ""}`;

  try {
    console.log(`[Groq] Generating AI pitch with Llama 3.3 70B for ${name}...`);
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.65,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    const subject = parsed.subject || `${firstName} - Built a bespoke Dallas digital showcase for your portfolio`;
    const textBody = parsed.body || parsed.textBody || "";
    const htmlBody = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6; padding: 20px;">${textBody.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</div>`;

    return {
      subject,
      textBody,
      htmlBody,
      aiGenerated: true,
      model: "llama-3.3-70b-versatile",
    };
  } catch (err) {
    console.warn(`[Groq] AI generation failed (${err.message}). Falling back to template.`);
    return generatePitch({
      name,
      slug,
      email,
      activeListingAddress,
      activeListingPrice,
      topSoldAddress,
      topSoldPrice,
      totalDeals,
    });
  }
}
