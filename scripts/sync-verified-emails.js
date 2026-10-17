import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

const discPath = path.join(rootDir, "data", "discovered-agents.json");
const disc = JSON.parse(fs.readFileSync(discPath, "utf8"));
const agentDir = path.join(rootDir, "src", "data", "agents");
const files = fs.readdirSync(agentDir).filter((f) => f.endsWith("Profile.js"));

let updatedCount = 0;
const log = [];

for (const f of files) {
  const content = fs.readFileSync(path.join(agentDir, f), "utf8");
  const emMatch = content.match(/email:\s*["']([^"']+)["']/i);
  const phMatch = content.match(/phone:\s*["']([^"']+)["']/i);
  const urlMatch = content.match(/profileUrl:\s*["']https:\/\/www\.compass\.com\/agents\/([^\/"']+)[\/"']/i);

  if (urlMatch && emMatch) {
    const slug = urlMatch[1];
    const realEmail = emMatch[1].trim();
    const realPhone = phMatch ? phMatch[1].trim() : "";
    const match = disc.find((d) => d.slug === slug);

    if (match) {
      let changed = false;
      if (realEmail && match.email !== realEmail) {
        log.push(`[${match.name || slug}] Email updated: "${match.email}" -> "${realEmail}"`);
        match.email = realEmail;
        changed = true;
      }
      if (realPhone && match.phone !== realPhone) {
        match.phone = realPhone;
        changed = true;
      }
      if (changed) {
        updatedCount++;
      }
    }
  }
}

fs.writeFileSync(discPath, JSON.stringify(disc, null, 2), "utf8");

console.log(`Sync completed. Updated ${updatedCount} agents in discovered-agents.json.`);
if (log.length > 0) {
  console.log("Updates:\n" + log.join("\n"));
}
