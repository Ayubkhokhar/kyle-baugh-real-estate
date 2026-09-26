<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { availableAgents } from "../composables/useAgentResolver";

const router = useRouter();
const searchQuery = ref("");
const selectedEnclave = ref("all");
const copiedSlug = ref(null);
const activePitchAgent = ref(null);

const enclaves = [
  { id: "all", label: "All Enclaves" },
  { id: "park-cities", label: "Park Cities & Preston Hollow" },
  { id: "lakewood", label: "Lakewood & East Dallas" },
  { id: "luxury", label: "Dallas Architectural & Custom" },
];

const enrichedAgents = computed(() => {
  return availableAgents.map((agent) => {
    const properties = agent.properties || [];
    const activeListing = properties[0]?.address || "Dallas Luxury Portfolio";
    const totalVolume = properties.reduce((acc, p) => acc + (p.price || 0), 0);
    const firstName = agent.name.split(" ")[0];
    const baseUrl = "https://realestate-advisory.ayubkhokhar786.workers.dev";
    const liveUrl = `${baseUrl}/${agent.slug}`;
    const manageUrl = `${baseUrl}/${agent.slug}/manage`;

    const smsPitch = `Hi ${firstName}, I built a modern, ultra-fast digital portfolio for your Dallas listings: ${liveUrl} ($0 monthly hosting forever). Let me know if you would like me to connect it to your custom domain!`;
    const emailSubject = `${properties[0]?.title || agent.name + "'s portfolio"} + your Dallas showcase (Built this for you)`;
    const emailBody = `Hi ${firstName},\n\nI noticed you’ve been doing strong numbers across Dallas, but your digital presence is still tied to the generic brokerage layout.\n\nI built a live concept for your brand featuring ${properties.length} of your listings:\n👉 ${liveUrl}\n\nKey features:\n1. $0/month hosting forever on Cloudflare Edge\n2. 60-Second Self-Serve Listing Console: ${manageUrl} (Passcode: admin123)\n\nLet me know if you would like to connect your custom domain this week!\n\nBest,\nAyub Khokhar\nayub@webpenter.com`;

    return {
      ...agent,
      propertiesCount: properties.length,
      activeListing,
      totalVolumeFormatted: totalVolume > 0 ? `$${(totalVolume / 1000000).toFixed(1)}M` : "$15M+",
      liveUrl,
      manageUrl,
      smsPitch,
      emailSubject,
      emailBody,
      email: agent.profile?.email || `${agent.slug}@compass.com`,
      phone: agent.profile?.phone || "(214) 980-3933",
      headshot: agent.profile?.headshot || null,
    };
  });
});

const filteredAgents = computed(() => {
  return enrichedAgents.value.filter((agent) => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchesSearch =
      !q ||
      agent.name.toLowerCase().includes(q) ||
      agent.slug.toLowerCase().includes(q) ||
      (agent.title && agent.title.toLowerCase().includes(q));

    let matchesEnclave = true;
    if (selectedEnclave.value === "park-cities") {
      matchesEnclave = (agent.title || "").toLowerCase().includes("park") || (agent.title || "").toLowerCase().includes("preston");
    } else if (selectedEnclave.value === "lakewood") {
      matchesEnclave = (agent.title || "").toLowerCase().includes("lakewood") || (agent.title || "").toLowerCase().includes("east dallas");
    } else if (selectedEnclave.value === "luxury") {
      matchesEnclave = (agent.title || "").toLowerCase().includes("luxury") || (agent.title || "").toLowerCase().includes("architectural");
    }

    return matchesSearch && matchesEnclave;
  });
});

function copyLink(url, slug) {
  navigator.clipboard.writeText(url).then(() => {
    copiedSlug.value = slug;
    setTimeout(() => {
      copiedSlug.value = null;
    }, 2000);
  });
}

function openPitchModal(agent) {
  activePitchAgent.value = agent;
}

function closePitchModal() {
  activePitchAgent.value = null;
}

function copyPitchText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Pitch copy copied to clipboard!");
  });
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
    <!-- Top Navigation Bar -->
    <header class="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-8">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-sm shadow-lg shadow-amber-500/20">
            W
          </div>
          <div>
            <span class="text-xs font-bold tracking-widest text-amber-400 uppercase font-mono">Webpenter · Mobile Control Suite</span>
            <h1 class="text-sm sm:text-base font-bold text-white leading-tight">Dallas Luxury Realtor Portals</h1>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-green-500/10 text-green-400 border border-green-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Cloudflare Edge Live
          </span>
          <router-link
            to="/kyle"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 transition"
          >
            Kyle Baugh Site &rarr;
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-8 space-y-6">
      <!-- Welcome Hero Banner -->
      <section class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-8 relative overflow-hidden shadow-2xl">
        <div class="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <span>🏛️</span> 8 Active Bespoke Portals Deployed
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dallas Agent Portals & Outreach Center
          </h2>
          <p class="text-sm text-slate-400 leading-relaxed">
            Manage your live client sites, test private mobile listing consoles, or dispatch SMS & email pitches directly from your phone on the go.
          </p>
        </div>

        <!-- Quick Summary Metrics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 sm:pt-6">
          <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div class="text-xs text-slate-500 font-mono">LIVE SITES</div>
            <div class="text-xl font-bold text-white">8 Portals</div>
          </div>
          <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div class="text-xs text-slate-500 font-mono">EDGE HOSTING</div>
            <div class="text-xl font-bold text-green-400">$0 / Month</div>
          </div>
          <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div class="text-xs text-slate-500 font-mono">SELF-SERVE CONSOLE</div>
            <div class="text-xl font-bold text-amber-400">60-Sec Sync</div>
          </div>
          <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div class="text-xs text-slate-500 font-mono">MARKET</div>
            <div class="text-xl font-bold text-white">Dallas, TX</div>
          </div>
        </div>
      </section>

      <!-- Filter & Search Controls -->
      <section class="space-y-3">
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <!-- Search Input -->
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
              🔍
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by agent name (e.g. Carson, Amy, Christine)..."
              class="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <!-- Enclave Filter Chips -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              v-for="enc in enclaves"
              :key="enc.id"
              @click="selectedEnclave = enc.id"
              :class="[
                'px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition',
                selectedEnclave === enc.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              ]"
            >
              {{ enc.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- Agent Portals Grid -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="agent in filteredAgents"
          :key="agent.id"
          class="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition duration-200 shadow-lg shadow-black/40 group"
        >
          <!-- Top Card Header -->
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <img
                  v-if="agent.headshot"
                  :src="agent.headshot"
                  :alt="agent.name"
                  class="w-12 h-12 rounded-full object-cover border-2 border-slate-700 bg-slate-800"
                  @error="$event.target.style.display = 'none'"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm font-mono"
                >
                  {{ agent.name.split(" ").map(n => n[0]).join("") }}
                </div>
                <div>
                  <h3 class="font-bold text-white text-base group-hover:text-amber-400 transition leading-tight">
                    {{ agent.name }}
                  </h3>
                  <span class="text-xs font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded inline-block mt-0.5">
                    /{{ agent.slug }}
                  </span>
                </div>
              </div>

              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                {{ agent.propertiesCount }} Listings
              </span>
            </div>

            <!-- Title & Territory -->
            <p class="text-xs text-slate-400 line-clamp-2">
              {{ agent.title }}
            </p>

            <!-- Contact Row -->
            <div class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-1 text-xs text-slate-400">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Email:</span>
                <span class="font-mono text-slate-300 truncate max-w-[200px]">{{ agent.email }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Phone:</span>
                <span class="text-slate-300">{{ agent.phone }}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons (Mobile-Optimized) -->
          <div class="space-y-2 pt-3 border-t border-slate-800/80">
            <!-- Primary Action Grid -->
            <div class="grid grid-cols-2 gap-2">
              <a
                :href="agent.liveUrl"
                target="_blank"
                class="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <span>🌐</span> View Portal
              </a>
              <a
                :href="agent.manageUrl"
                target="_blank"
                class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs text-center border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <span>⚙️</span> Console
              </a>
            </div>

            <!-- Mobile Outreach Buttons (Native SMS, Email & Copy) -->
            <div class="grid grid-cols-3 gap-1.5 pt-1">
              <!-- Native SMS Pitch -->
              <a
                :href="`sms:${agent.phone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(agent.smsPitch)}`"
                class="px-2 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg text-center transition flex items-center justify-center gap-1"
                title="Send SMS Pitch from phone"
              >
                <span>📱</span> SMS
              </a>

              <!-- Native Email Pitch -->
              <a
                :href="`mailto:${agent.email}?subject=${encodeURIComponent(agent.emailSubject)}&body=${encodeURIComponent(agent.emailBody)}`"
                class="px-2 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg text-center transition flex items-center justify-center gap-1"
                title="Open Mail client"
              >
                <span>✉️</span> Mail
              </a>

              <!-- Copy Live Link Button -->
              <button
                @click="copyLink(agent.liveUrl, agent.slug)"
                class="px-2 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-lg text-center transition flex items-center justify-center gap-1"
              >
                <span>{{ copiedSlug === agent.slug ? '✓' : '🔗' }}</span>
                <span>{{ copiedSlug === agent.slug ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>

            <!-- Pitch Details Drawer Toggle -->
            <button
              @click="openPitchModal(agent)"
              class="w-full text-center text-xs text-slate-500 hover:text-amber-400 py-1 transition font-mono flex items-center justify-center gap-1"
            >
              <span>📄</span> View Pre-Drafted Pitch & Details &rarr;
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- Pre-Drafted Pitch Slideover / Modal -->
    <div
      v-if="activePitchAgent"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="closePitchModal"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span class="text-xs font-mono text-amber-400 uppercase">Pre-Drafted Outreach</span>
            <h3 class="text-lg font-bold text-white">{{ activePitchAgent.name }}</h3>
          </div>
          <button @click="closePitchModal" class="text-slate-400 hover:text-white text-lg px-2">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-400 font-semibold mb-1">Email Subject:</label>
            <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 font-mono truncate">
              {{ activePitchAgent.emailSubject }}
            </div>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Email Pitch Body:</label>
            <textarea
              readonly
              rows="7"
              class="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-mono focus:outline-none"
              :value="activePitchAgent.emailBody"
            ></textarea>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Mobile SMS / WhatsApp Pitch:</label>
            <textarea
              readonly
              rows="3"
              class="w-full bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-mono focus:outline-none"
              :value="activePitchAgent.smsPitch"
            ></textarea>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button
            @click="copyPitchText(activePitchAgent.emailBody)"
            class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            📋 Copy Email Copy
          </button>
          <button
            @click="copyPitchText(activePitchAgent.smsPitch)"
            class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition"
          >
            📱 Copy SMS Copy
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-auto border-t border-slate-800/80 py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>Webpenter Real Estate Advisory &middot; Autonomous Dallas Architectural Suite</p>
        <p class="font-mono text-[11px] text-slate-600">Zero Third-Party Retainers &middot; $0/mo Edge Infrastructure</p>
      </div>
    </footer>
  </div>
</template>
