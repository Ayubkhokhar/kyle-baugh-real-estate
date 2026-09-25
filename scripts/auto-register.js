// scripts/auto-register.js
// Autonomous code-rewriter that injects new real estate agents into Vue router, resolver, and properties state.
// 100% deterministic, zero AI tokens required. Handles hyphenated slugs safely.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const RESOLVER_PATH = path.join(rootDir, "src", "composables", "useAgentResolver.js");
const PROPERTIES_PATH = path.join(rootDir, "src", "composables", "useProperties.js");
const ROUTER_PATH = path.join(rootDir, "src", "router", "index.js");

export function toIdentifier(str) {
  // Convert "brandon-stewart" or "liz_chalfant" into valid JS identifier "brandonStewart", "lizChalfant"
  return (str || "agent")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

export function registerAgentInCodebase({
  slug,
  name,
  title = "Dallas Luxury & Architectural Specialist",
  color = "#BFA181",
  totalProperties = 1,
  activeCount = 1,
  soldCount = 0,
  agentUrl = "",
}) {
  const ident = toIdentifier(slug);
  console.log(`[Auto-Register] Registering '${name}' (slug: '${slug}', identifier: '${ident}') into codebase...`);

  let resolverModified = false;
  let propertiesModified = false;
  let routerModified = false;

  // 1. UPDATE useAgentResolver.js
  if (fs.existsSync(RESOLVER_PATH)) {
    let resolverContent = fs.readFileSync(RESOLVER_PATH, "utf-8");

    // Profile import
    const profileImport = `import { ${ident}Profile } from "../data/agents/${ident}Profile";`;
    if (!resolverContent.includes(`../data/agents/${ident}Profile`)) {
      resolverContent = resolverContent.replace(
        /(import\s+\{\s*\w+Profile\s*\}\s+from\s+["']\.\.\/data\/agents\/\w+Profile["'];?\r?\n)/,
        `$1${profileImport}\n`
      );
      resolverModified = true;
    }

    // Properties import
    const propImport = `import { compassProperties as ${ident}Properties } from "../data/agents/${ident}Properties";`;
    if (!resolverContent.includes(`../data/agents/${ident}Properties`)) {
      resolverContent = resolverContent.replace(
        /(import\s+\{\s*compassProperties\s+as\s+\w+Properties\s*\}\s+from\s+["']\.\.\/data\/agents\/\w+Properties["'];?\r?\n)/,
        `$1${propImport}\n`
      );
      resolverModified = true;
    }

    // availableAgents array entry
    const agentEntry = `  {
    id: "${slug}",
    name: "${name.replace(/"/g, '\\"')}",
    title: "${title.replace(/"/g, '\\"')}",
    slug: "${slug}",
    profile: ${ident}Profile,
    properties: ${ident}Properties,
    previewColor: "${color}",
  },`;

    if (!resolverContent.includes(`id: "${slug}"`)) {
      resolverContent = resolverContent.replace(
        /export\s+const\s+availableAgents\s*=\s*\[([\s\S]*?)\];/,
        (match, inner) => {
          return `export const availableAgents = [${inner.trimEnd()}\n${agentEntry}\n];`;
        }
      );
      resolverModified = true;
    }

    if (resolverModified) {
      fs.writeFileSync(RESOLVER_PATH, resolverContent, "utf-8");
      console.log(`[Auto-Register] ✓ Updated useAgentResolver.js`);
    }
  }

  // 2. UPDATE useProperties.js
  if (fs.existsSync(PROPERTIES_PATH)) {
    let propContent = fs.readFileSync(PROPERTIES_PATH, "utf-8");

    // Properties import
    const propImport = `import { compassProperties as ${ident}Properties } from "../data/agents/${ident}Properties";`;
    if (!propContent.includes(`../data/agents/${ident}Properties`)) {
      propContent = propContent.replace(
        /(import\s+\{\s*compassProperties\s+as\s+\w+Properties\s*\}\s+from\s+["']\.\.\/data\/agents\/\w+Properties["'];?\r?\n)/,
        `$1${propImport}\n`
      );
      propertiesModified = true;
    }

    // Meta object
    const metaBlock = `const ${ident}CompassMeta = {
  lastSynced: "${new Date().toISOString()}",
  totalProperties: ${totalProperties},
  activeCount: ${activeCount},
  soldCount: ${soldCount},
  leasedCount: 0,
  imagesDownloaded: ${totalProperties > 0 ? totalProperties + 8 : 1},
  agentUrl: "${agentUrl.replace(/"/g, '\\"')}",
  syncedAgent: "${name.replace(/"/g, '\\"')}",
};`;

    if (!propContent.includes(`const ${ident}CompassMeta =`)) {
      propContent = propContent.replace(
        /(const\s+\w+CompassMeta\s*=\s*\{[\s\S]*?\};\r?\n)/,
        `$1\n${metaBlock}\n`
      );
      propertiesModified = true;
    }

    // getInitialListForAgent branch
    const listBranch = `  if (agentId === "${slug}") {\n    return ${ident}Properties;\n  }\n`;
    if (!propContent.includes(`agentId === "${slug}"`)) {
      propContent = propContent.replace(
        /(function\s+getInitialListForAgent\s*\([^\)]*\)\s*\{)/,
        `$1\n${listBranch}`
      );
      propertiesModified = true;
    }

    // getInitialMetaForAgent branch
    const metaBranch = `  if (agentId === "${slug}") {\n    return ${ident}CompassMeta;\n  }\n`;
    const metaSearch = "function getInitialMetaForAgent";
    if (propContent.includes(metaSearch) && !propContent.includes(`return ${ident}CompassMeta;`)) {
      propContent = propContent.replace(
        /(function\s+getInitialMetaForAgent\s*\([^\)]*\)\s*\{)/,
        `$1\n${metaBranch}`
      );
      propertiesModified = true;
    }

    // allKnown fallback array
    if (!propContent.includes(`...${ident}Properties`)) {
      propContent = propContent.replace(
        /const\s+allKnown\s*=\s*\[/,
        `const allKnown = [...${ident}Properties, `
      );
      propertiesModified = true;
    }

    if (propertiesModified) {
      fs.writeFileSync(PROPERTIES_PATH, propContent, "utf-8");
      console.log(`[Auto-Register] ✓ Updated useProperties.js`);
    }
  }

  // 3. UPDATE router/index.js
  if (fs.existsSync(ROUTER_PATH)) {
    let routerContent = fs.readFileSync(ROUTER_PATH, "utf-8");

    const homeRoute = `  {
    path: "/${slug}",
    name: "${ident}-home",
    component: HomeView,
  },`;

    const manageRoute = `  {
    path: "/${slug}/manage",
    name: "${ident}-manage",
    component: ManageView,
  },`;

    if (!routerContent.includes(`path: "/${slug}"`)) {
      routerContent = routerContent.replace(
        /(\s*\{\s*path:\s*["']\/agent\/:agentSlug["'])/,
        `\n${homeRoute}$1`
      );
      routerModified = true;
    }

    if (!routerContent.includes(`path: "/${slug}/manage"`)) {
      routerContent = routerContent.replace(
        /(\s*\{\s*path:\s*["']\/:agentSlug\/manage["'])/,
        `\n${manageRoute}$1`
      );
      routerModified = true;
    }

    if (routerModified) {
      fs.writeFileSync(ROUTER_PATH, routerContent, "utf-8");
      console.log(`[Auto-Register] ✓ Updated router/index.js`);
    }
  }

  return {
    success: true,
    ident,
    resolverModified,
    propertiesModified,
    routerModified,
  };
}
