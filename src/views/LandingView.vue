<script setup>
import { ref } from "vue";
import { availableAgents } from "../composables/useAgentResolver";

const featuredAgents = availableAgents.slice(0, 6);

const services = [
  {
    icon: "🏛️",
    title: "Bespoke Real Estate Portals",
    desc: "Ultra-fast, tailored architectural portfolios built specifically for elite real estate producers. Designed to win multimillion-dollar listings and impress high-net-worth clients.",
    highlights: ["$0/mo edge hosting forever", "60-second mobile listing console", "High-res WebP media gallery"]
  },
  {
    icon: "⚡",
    title: "Full-Stack Web Engineering",
    desc: "Modern serverless architecture powered by Cloudflare Global Edge, Vue 3, and Vite. Zero bloated WordPress databases, zero slow plugins, sub-400ms global response time.",
    highlights: ["Global CDN distribution", "Instant mobile load speeds", "Clean architectural design systems"]
  },
  {
    icon: "🤖",
    title: "Business & CRM Automation",
    desc: "Custom automated outbound pipelines, lead discovery scrapers, and lifecycle follow-up engines that turn cold contacts into high-value advisory clients without third-party retainers.",
    highlights: ["Hostinger & Titan SMTP engines", "Smart follow-up sequences", "Automated CRM state tracking"]
  }
];
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
    <!-- Navigation Bar -->
    <header class="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-4 sm:px-8">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg shadow-amber-500/20">
            W
          </div>
          <div>
            <span class="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-mono">Webpenter · Real Estate Advisory</span>
            <div class="text-base font-bold text-white tracking-tight">Ayub Khokhar</div>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
          <a href="#expertise" class="hover:text-amber-400 transition">Expertise</a>
          <a href="#showcase" class="hover:text-amber-400 transition">Live Portals</a>
          <a href="#why-us" class="hover:text-amber-400 transition">Why Webpenter</a>
          <a href="#contact" class="hover:text-amber-400 transition">Contact</a>
        </nav>

        <div class="flex items-center gap-3">
          <a
            href="mailto:ayub@webpenter.com?subject=Real%20Estate%20Portal%20Inquiry"
            class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
          >
            Start a Project
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 space-y-20 pb-20">
      <!-- Hero Section -->
      <section class="max-w-7xl mx-auto px-4 pt-12 sm:pt-20 sm:px-8 text-center space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
          <span>🏛️</span> Real Estate Digital Architecture & Business Automation
        </div>

        <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          High-Performance Real Estate Websites & Autonomous Systems
        </h1>

        <p class="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          I build custom architectural digital portals on Cloudflare Global Edge with <strong class="text-white">$0 monthly hosting forever</strong>, sub-400ms load speeds, and automated business workflows for top luxury advisors.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <a
            href="#showcase"
            class="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
          >
            Explore Live Portals &rarr;
          </a>
          <a
            href="#expertise"
            class="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl text-sm transition"
          >
            Our Core Expertise
          </a>
        </div>

        <!-- Metrics Strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <div class="text-2xl sm:text-3xl font-black text-green-400 font-mono">$0 / mo</div>
            <div class="text-xs text-slate-400 mt-1">Hosting Retainers Forever</div>
          </div>
          <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <div class="text-2xl sm:text-3xl font-black text-amber-400 font-mono">&lt; 400ms</div>
            <div class="text-xs text-slate-400 mt-1">Edge Global Speed</div>
          </div>
          <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <div class="text-2xl sm:text-3xl font-black text-white font-mono">60-Sec</div>
            <div class="text-xs text-slate-400 mt-1">Mobile Listing Console</div>
          </div>
          <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-center">
            <div class="text-2xl sm:text-3xl font-black text-blue-400 font-mono">100%</div>
            <div class="text-xs text-slate-400 mt-1">SPF/DKIM Inbox Rate</div>
          </div>
        </div>
      </section>

      <!-- Expertise Pillars Section -->
      <section id="expertise" class="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 scroll-mt-24">
        <div class="text-center space-y-2">
          <span class="text-xs font-mono text-amber-400 uppercase tracking-widest">Specialized Capabilities</span>
          <h2 class="text-2xl sm:text-4xl font-extrabold text-white">Three Pillars of Value</h2>
          <p class="text-sm text-slate-400 max-w-xl mx-auto">
            Combining luxury aesthetic design, modern cloud infrastructure, and autonomous sales technology.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(service, idx) in services"
            :key="idx"
            class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-amber-500/40 transition duration-200"
          >
            <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl">
              {{ service.icon }}
            </div>
            <h3 class="text-xl font-bold text-white">{{ service.title }}</h3>
            <p class="text-sm text-slate-400 leading-relaxed">{{ service.desc }}</p>

            <ul class="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
              <li v-for="(h, i) in service.highlights" :key="i" class="flex items-center gap-2">
                <span class="text-amber-400">✓</span> {{ h }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Featured Live Portals Showcase -->
      <section id="showcase" class="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 scroll-mt-24">
        <div class="text-center space-y-2">
          <span class="text-xs font-mono text-amber-400 uppercase tracking-widest">Proof of Work</span>
          <h2 class="text-2xl sm:text-4xl font-extrabold text-white">Featured Live Client Portals</h2>
          <p class="text-sm text-slate-400 max-w-xl mx-auto">
            Explore live, working digital showcases built for top boutique luxury producers in Dallas, Texas.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="agent in featuredAgents"
            :key="agent.id"
            class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition group shadow-xl"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  /{{ agent.slug }}
                </span>
                <span class="text-xs text-slate-500 font-mono">Cloudflare Edge</span>
              </div>
              <h3 class="text-xl font-bold text-white group-hover:text-amber-400 transition">
                {{ agent.name }}
              </h3>
              <p class="text-xs text-slate-400 line-clamp-2">{{ agent.title }}</p>

              <div class="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span class="text-slate-500">Flagship Production:</span>
                <span class="text-slate-200 font-medium ml-1">{{ agent.properties?.[0]?.title || 'Dallas Luxury Enclave' }}</span>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <router-link
                :to="`/${agent.slug}`"
                class="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs text-center transition shadow-md shadow-amber-500/10"
              >
                Inspect Live Portal &rarr;
              </router-link>
              <router-link
                :to="`/${agent.slug}/manage`"
                class="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs text-center border border-slate-700 transition"
              >
                Console
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Why Choose Webpenter Section -->
      <section id="why-us" class="max-w-5xl mx-auto px-4 sm:px-8 space-y-8 scroll-mt-24">
        <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-12 space-y-6">
          <div class="text-center space-y-2">
            <span class="text-xs font-mono text-amber-400 uppercase tracking-widest">The Edge Advantage</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white">How Webpenter Replaces Legacy Agencies</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div class="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-3">
              <h4 class="font-bold text-red-400 flex items-center gap-2">
                <span>✕</span> Legacy Web Agencies
              </h4>
              <ul class="text-xs text-slate-400 space-y-2">
                <li>• $300 to $800 monthly hosting and maintenance retainers.</li>
                <li>• Slow WordPress sites that fail Google PageSpeed on mobile.</li>
                <li>• 2-week delays and invoices just to upload a new listing.</li>
                <li>• Generic corporate brokerage templates that don't build personal equity.</li>
              </ul>
            </div>

            <div class="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 space-y-3">
              <h4 class="font-bold text-green-400 flex items-center gap-2">
                <span>✓</span> The Webpenter Edge Architecture
              </h4>
              <ul class="text-xs text-slate-300 space-y-2">
                <li>• <strong>$0 / month hosting forever</strong> on Cloudflare's serverless edge.</li>
                <li>• <strong>Sub-400ms lightning page loads</strong> with automatic WebP media delivery.</li>
                <li>• <strong>60-Second Self-Serve Console:</strong> Add new listings from your phone anytime.</li>
                <li>• <strong>Independent digital equity:</strong> Keep your clients even if you switch brokerages.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="max-w-3xl mx-auto px-4 sm:px-8 text-center space-y-6 scroll-mt-24">
        <div class="space-y-2">
          <span class="text-xs font-mono text-amber-400 uppercase tracking-widest">Get in Touch</span>
          <h2 class="text-2xl sm:text-4xl font-extrabold text-white">Ready to Elevate Your Digital Standard?</h2>
          <p class="text-sm text-slate-400">
            Let's discuss building your bespoke architectural portal or automating your client acquisition.
          </p>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:ayub@webpenter.com?subject=Real%20Estate%20Portal%20Inquiry"
              class="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <span>✉️</span> ayub@webpenter.com
            </a>
            <a
              href="https://webpenter.com"
              target="_blank"
              class="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <span>🌐</span> Visit webpenter.com
            </a>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800/80 py-8 px-4 sm:px-8 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Webpenter. Designed & Engineered by Ayub Khokhar.</p>
        <div class="flex items-center gap-4 text-xs">
          <span>Dallas, TX · Cloudflare Edge</span>
          <router-link to="/login" class="text-slate-600 hover:text-amber-400 transition font-mono flex items-center gap-1">
            <span>🔒</span> Admin Login
          </router-link>
        </div>
      </div>
    </footer>
  </div>
</template>
