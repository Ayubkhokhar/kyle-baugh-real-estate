<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  siteSettings: {
    type: Object,
    required: true,
  },
  filteredProperties: {
    type: Array,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
  activeCategory: {
    type: String,
    required: true,
  },
  searchQuery: {
    type: String,
    required: true,
  },
  maxPrice: {
    type: Number,
    required: true,
  },
  consultForm: {
    type: Object,
    required: true,
  },
  isSubmittingConsult: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:activeCategory",
  "update:searchQuery",
  "update:maxPrice",
  "submitConsult",
]);

// Flagship property (featured spotlight)
const flagshipProperty = computed(() => {
  return (
    props.filteredProperties.find((p) => p.status === "Active Exclusive") ||
    props.filteredProperties[0] ||
    null
  );
});

// Grid properties (excluding flagship if present)
const gridProperties = computed(() => {
  if (!flagshipProperty.value) return props.filteredProperties;
  return props.filteredProperties.filter((p) => p.id !== flagshipProperty.value.id);
});

// Active Blueprint tab state
const activeForensicTab = ref("foundation");
</script>

<template>
  <div class="cinematic-design bg-[#0A0D12] text-slate-100 selection:bg-amber-400 selection:text-black">
    <!-- 1. FULL-VIEWPORT 100VH CINEMATIC HERO -->
    <section class="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-white/10">
      <!-- Background Image with Dark Gradient & Film Grain -->
      <div class="absolute inset-0 z-0">
        <img
          src="/images/compass/2007-euclid-avenue-cover.webp"
          alt="Dallas Luxury Architectural Estate"
          fetchpriority="high"
          class="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out brightness-90"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0A0D12] via-[#0A0D12]/75 to-[#0A0D12]/45"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,13,18,0.6)_100%)]"></div>
        <!-- Architectural Grid Overlay -->
        <div class="absolute inset-0 opacity-15 pointer-events-none" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 60px 60px;"></div>
      </div>

      <!-- Hero Header & Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-5 lg:px-12 pt-16 lg:pt-24 w-full flex-grow flex flex-col justify-center">
        <!-- Top Status Pill -->
        <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md w-fit mb-6 shadow-lg">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
            COMPASS LUXURY DIVISION · DALLAS ARCHITECTURAL CORRIDORS
          </span>
        </div>

        <!-- Headline -->
        <div class="max-w-4xl">
          <h1 class="font-headline text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
            ENGINEERED LUXURY.<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
              DISCREET ADVISORY.
            </span>
          </h1>
          <p class="text-base sm:text-xl text-slate-300 font-light max-w-2xl leading-relaxed mb-8">
            {{ siteSettings.heroSubheading || "Multi-million dollar producer uniting Dallas's most coveted residential enclaves with forensic construction science rigor." }}
          </p>
        </div>

        <!-- EMBEDDED GLASSMORPHIC SEARCH HUD -->
        <div class="max-w-4xl p-4 sm:p-5 rounded-2xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl">
          <div class="flex flex-col md:flex-row gap-3 items-center mb-4">
            <div class="relative flex-1 w-full">
              <span class="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-xl">search</span>
              <input
                :value="searchQuery"
                @input="emit('update:searchQuery', $event.target.value)"
                type="text"
                placeholder="Search by address, enclave, or architectural style..."
                class="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-amber-300 transition-colors"
              />
            </div>
            <div class="w-full md:w-56">
              <select
                :value="maxPrice"
                @change="emit('update:maxPrice', Number($event.target.value))"
                class="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-300 transition-colors"
              >
                <option :value="0" class="bg-slate-900 text-white">All Price Points</option>
                <option :value="1000000" class="bg-slate-900 text-white">Up to $1,000,000</option>
                <option :value="2500000" class="bg-slate-900 text-white">Up to $2,500,000</option>
                <option :value="5000000" class="bg-slate-900 text-white">Up to $5,000,000</option>
                <option :value="10000000" class="bg-slate-900 text-white">Up to $10,000,000</option>
              </select>
            </div>
            <a
              href="#portfolio"
              class="w-full md:w-auto px-6 py-2.5 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-md text-center shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>Explore Portfolio</span>
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </a>
          </div>

          <!-- Enclave Quick Chips -->
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span class="text-[10px] uppercase tracking-wider text-slate-400 font-medium mr-1 hidden sm:inline">Enclaves:</span>
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="emit('update:activeCategory', cat.id)"
              :class="[
                'px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider font-semibold transition-all duration-150',
                activeCategory === cat.id
                  ? 'bg-amber-300 text-slate-950 shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              ]"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Live Metric Ribbon (Bottom of Hero) -->
      <div class="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl mt-12">
        <div class="max-w-7xl mx-auto px-5 lg:px-12 py-5">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-amber-300 text-2xl">verified</span>
              <div>
                <p class="font-headline text-lg sm:text-xl text-white font-semibold">{{ siteSettings.stat1Value || "$100M+" }}</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{{ siteSettings.stat1Label || "Sales Volume" }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-amber-300 text-2xl">engineering</span>
              <div>
                <p class="font-headline text-lg sm:text-xl text-white font-semibold">B.S. Construction</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Structural Rigor</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-amber-300 text-2xl">payments</span>
              <div>
                <p class="font-headline text-lg sm:text-xl text-white font-semibold">0% Upfront Capital</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Pre-Sale Concierge</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-amber-300 text-2xl">visibility_off</span>
              <div>
                <p class="font-headline text-lg sm:text-xl text-white font-semibold">35% Off-Market</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Discreet Syndication</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. FLAGSHIP PROPERTY PANORAMIC SPOTLIGHT -->
    <section v-if="flagshipProperty" class="py-16 lg:py-24 max-w-7xl mx-auto px-5 lg:px-12 border-b border-white/10">
      <div class="flex items-center justify-between mb-8">
        <div>
          <span class="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-semibold block mb-1">
            FLAGSHIP ARCHITECTURAL EXCLUSIVE
          </span>
          <h2 class="font-headline text-2xl sm:text-4xl text-white">Premier Dallas Residence</h2>
        </div>
        <router-link
          :to="'/property/' + flagshipProperty.id"
          class="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-300 hover:text-amber-200 font-semibold"
        >
          Full Architectural Dossier
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </router-link>
      </div>

      <div class="rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-0">
        <!-- Left: High-Res Panoramic Visual -->
        <div class="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden group">
          <img
            :src="flagshipProperty.heroImage || '/images/compass/2007-euclid-avenue-cover.webp'"
            :alt="flagshipProperty.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
          <!-- Badges Overlay -->
          <div class="absolute top-5 left-5 flex flex-wrap gap-2">
            <span class="px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 text-[11px] uppercase tracking-wider font-bold shadow-lg backdrop-blur-md">
              {{ flagshipProperty.status }}
            </span>
            <span v-if="flagshipProperty.isCompassListing" class="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] uppercase tracking-wider font-semibold border border-white/30 backdrop-blur-md inline-flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px] text-amber-300">verified</span>
              Compass Exclusive
            </span>
          </div>
          <!-- Price Tag Floating -->
          <div class="absolute bottom-5 left-5 right-5 flex justify-between items-end">
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-300 font-semibold">Offered At</p>
              <p class="font-headline text-3xl sm:text-4xl text-white font-bold">{{ flagshipProperty.priceFormatted }}</p>
            </div>
            <div v-if="flagshipProperty.pricePerSqft" class="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-right">
              <span class="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Metric</span>
              <span class="font-semibold text-xs text-amber-300">${{ flagshipProperty.pricePerSqft }} / SQ FT</span>
            </div>
          </div>
        </div>

        <!-- Right: Dossier Details -->
        <div class="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <span class="text-[11px] uppercase tracking-widest text-amber-300 font-bold block mb-2">
              {{ flagshipProperty.neighborhood }}
            </span>
            <h3 class="font-headline text-2xl sm:text-3xl text-white font-bold mb-3">
              {{ flagshipProperty.title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 font-light leading-relaxed mb-6">
              {{ flagshipProperty.tagline || flagshipProperty.description }}
            </p>

            <!-- Specs Grid -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Bedrooms / Baths</span>
                <span class="text-sm font-semibold text-white">{{ flagshipProperty.bedrooms }} Beds · {{ flagshipProperty.bathrooms }} Baths</span>
              </div>
              <div class="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Interior Living</span>
                <span class="text-sm font-semibold text-white">{{ flagshipProperty.sqft?.toLocaleString() }} Sq Ft</span>
              </div>
              <div class="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Parcel Size</span>
                <span class="text-sm font-semibold text-white">{{ flagshipProperty.lotSize || "N/A" }}</span>
              </div>
              <div class="p-3.5 rounded-xl bg-white/[0.04] border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Architectural Era</span>
                <span class="text-sm font-semibold text-white">{{ flagshipProperty.yearBuilt }} Built</span>
              </div>
            </div>

            <!-- Forensic Highlight -->
            <div class="p-4 rounded-xl bg-amber-400/[0.08] border border-amber-300/30 flex items-start gap-3 mb-6">
              <span class="material-symbols-outlined text-amber-300 text-xl mt-0.5">construction</span>
              <div>
                <p class="text-xs font-semibold text-amber-200">Forensic Construction Audit</p>
                <p class="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  Audited subflooring, moisture barrier continuity, and structural pier settlement verified prior to syndication.
                </p>
              </div>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <router-link
              :to="'/property/' + flagshipProperty.id"
              class="flex-1 py-3 px-5 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all duration-200"
            >
              Explore Residence Dossier
            </router-link>
            <a
              href="#consultation"
              class="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs uppercase tracking-wider text-center border border-white/20 transition-all duration-200"
            >
              Request VIP Showing
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. ASYMMETRIC RESIDENCES MAGAZINE GRID -->
    <section class="py-16 lg:py-24 max-w-7xl mx-auto px-5 lg:px-12 border-b border-white/10" id="portfolio">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span class="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-semibold block mb-1">
            CURATED ARCHITECTURAL PORTFOLIO
          </span>
          <h2 class="font-headline text-3xl sm:text-4xl text-white">Active Exclusives & Transacted Estates</h2>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400">Showing {{ filteredProperties.length }} Residences</span>
        </div>
      </div>

      <!-- Grid Cards -->
      <div v-if="filteredProperties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article
          v-for="prop in filteredProperties"
          :key="prop.id"
          class="group rounded-2xl overflow-hidden bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-300/50 transition-all duration-300 flex flex-col shadow-xl"
        >
          <!-- Image Frame -->
          <div class="relative aspect-[16/11] overflow-hidden bg-slate-900">
            <img
              :src="prop.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'"
              :alt="prop.title"
              loading="lazy"
              decoding="async"
              width="400"
              height="275"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

            <!-- Badges -->
            <div class="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
              <span
                :class="[
                  'px-2.5 py-1 rounded-md backdrop-blur-md text-[10px] uppercase tracking-wider font-bold border',
                  prop.status === 'Active Exclusive' ? 'bg-emerald-500/90 text-slate-950 border-emerald-400' :
                  prop.status === 'Private Exclusive' ? 'bg-amber-300 text-slate-950 border-amber-300' :
                  prop.status === 'Pending' ? 'bg-sky-500 text-white border-sky-400' :
                  'bg-white/15 text-white border-white/20'
                ]"
              >
                {{ prop.status }}
              </span>
              <span
                v-if="prop.isCompassListing"
                class="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-semibold border border-white/20 inline-flex items-center gap-1"
              >
                <span class="material-symbols-outlined text-[12px] text-amber-300">verified</span>
                Compass
              </span>
            </div>

            <div class="absolute bottom-3.5 left-3.5 right-3.5 flex justify-between items-end">
              <p class="font-headline text-2xl text-white font-bold">
                {{ prop.priceFormatted }}
              </p>
              <span v-if="prop.pricePerSqft" class="text-[10px] text-slate-300 font-semibold bg-black/60 px-2 py-1 rounded border border-white/10 backdrop-blur-md">
                ${{ prop.pricePerSqft }}/sqft
              </span>
            </div>
          </div>

          <!-- Content Body -->
          <div class="p-6 flex flex-col flex-grow justify-between">
            <div>
              <p class="text-[11px] uppercase tracking-wider text-amber-300 font-semibold mb-1">
                {{ prop.neighborhood }}
              </p>
              <h3 class="font-headline text-xl text-white font-semibold mb-2 group-hover:text-amber-200 transition-colors">
                {{ prop.title }}
              </h3>
              <p class="text-xs text-slate-300 font-light line-clamp-2 leading-relaxed mb-4">
                {{ prop.tagline || prop.description }}
              </p>
            </div>

            <div class="pt-4 border-t border-white/10">
              <div class="flex items-center justify-between text-slate-400 text-xs mb-4 font-medium">
                <span>{{ prop.bedrooms }} Beds</span>
                <span class="text-white/20">|</span>
                <span>{{ prop.bathrooms }} Baths</span>
                <span class="text-white/20">|</span>
                <span>{{ prop.sqft?.toLocaleString() }} Sq Ft</span>
              </div>

              <router-link
                :to="'/property/' + prop.id"
                class="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-amber-300 hover:text-slate-950 text-white text-xs uppercase tracking-widest font-semibold text-center transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <span>View Dossier</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </router-link>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="text-center py-16 rounded-2xl bg-white/[0.04] border border-white/10 p-8">
        <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">home_work</span>
        <p class="font-headline text-xl text-white">No residences match your current search filters.</p>
        <p class="text-xs text-slate-400 mt-1">Adjust your price bracket or clear the enclave filter.</p>
        <button
          @click="emit('update:activeCategory', 'all'); emit('update:searchQuery', ''); emit('update:maxPrice', 0);"
          class="mt-4 px-6 py-2.5 rounded-xl bg-amber-300 text-slate-950 text-xs uppercase tracking-wider font-bold hover:bg-amber-400 transition-colors"
        >
          Reset All Filters
        </button>
      </div>
    </section>

    <!-- 4. INTERACTIVE 3D BLUEPRINT & FORENSICS CARDS -->
    <section class="py-20 lg:py-28 max-w-7xl mx-auto px-5 lg:px-12 border-b border-white/10 relative overflow-hidden" id="construction">
      <!-- Decorative Blueprint Lines -->
      <div class="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-amber-300/5 blur-3xl pointer-events-none"></div>

      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold block mb-2">
          CONSTRUCTION SCIENCE RIGOR
        </span>
        <h2 class="font-headline text-3xl sm:text-5xl text-white font-bold leading-tight">
          Structural Engineering Meets Luxury Discretion.
        </h2>
        <p class="text-sm text-slate-300 mt-4 leading-relaxed font-light">
          Unlike traditional brokers who evaluate cosmetic staging, Kyle holds a formal Bachelor of Science in Construction Science from OU. Former manager of NASA flight facilities and Love Field infrastructure.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Card 1 -->
        <div class="p-8 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-amber-300/60 transition-all duration-300 relative group flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-300/30 flex items-center justify-center mb-6 text-amber-300">
              <span class="material-symbols-outlined text-2xl">foundation</span>
            </div>
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">01 / STRUCTURAL AUDIT</span>
            <h3 class="font-headline text-xl text-white font-bold mb-3">
              Pier & Beam Foundation Forensics
            </h3>
            <p class="text-xs text-slate-300 font-light leading-relaxed">
              Dallas's expansive Blackland Prairie soils inflict severe torque on foundations. We crawl subflooring, measure beam deflection, and audit moisture barriers before you write or accept offers.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-white/10 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">shield</span>
            Protects against $50K+ unseen repairs
          </div>
        </div>

        <!-- Card 2 -->
        <div class="p-8 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-amber-300/60 transition-all duration-300 relative group flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-300/30 flex items-center justify-center mb-6 text-amber-300">
              <span class="material-symbols-outlined text-2xl">payments</span>
            </div>
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">02 / CAPITAL PROGRAM</span>
            <h3 class="font-headline text-xl text-white font-bold mb-3">
              0% Upfront Concierge Renovation
            </h3>
            <p class="text-xs text-slate-300 font-light leading-relaxed">
              Kyle front-funds, coordinates, and inspects high-yield aesthetic renovations. Zero out-of-pocket interest or upfront fees, recouped strictly at closing to maximize your net proceed.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-white/10 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">trending_up</span>
            Averages +$180K over baseline sale price
          </div>
        </div>

        <!-- Card 3 -->
        <div class="p-8 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-amber-300/60 transition-all duration-300 relative group flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-300/30 flex items-center justify-center mb-6 text-amber-300">
              <span class="material-symbols-outlined text-2xl">lock</span>
            </div>
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">03 / PRIVATE NETWORK</span>
            <h3 class="font-headline text-xl text-white font-bold mb-3">
              Off-Market Syndication & Discretion
            </h3>
            <p class="text-xs text-slate-300 font-light leading-relaxed">
              Over 35% of Kyle's transactions execute completely off-MLS through direct family office networks and high-profile executives, safeguarding absolute confidentiality.
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-white/10 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">verified_user</span>
            Zero public price drops or public digital footprints
          </div>
        </div>
      </div>
    </section>

    <!-- 5. LANDMARK TRANSACTIONS DEAL WALL -->
    <section class="py-20 lg:py-28 max-w-7xl mx-auto px-5 lg:px-12 border-b border-white/10" id="track-record">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span class="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold block mb-1">
            VERIFIED HISTORICAL PERFORMANCE
          </span>
          <h2 class="font-headline text-3xl sm:text-4xl text-white font-bold">Landmark Past Closings</h2>
        </div>
        <div class="text-right">
          <span class="font-headline text-3xl sm:text-4xl text-amber-300 font-bold">$100M+</span>
          <span class="block text-xs text-slate-400 uppercase tracking-widest font-semibold">Career Volume</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all duration-200">
          <div class="flex justify-between items-start mb-3">
            <span class="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-bold">
              Closed in 8 Days
            </span>
            <span class="text-[11px] text-slate-400 font-medium">University Park</span>
          </div>
          <h4 class="font-headline text-xl text-white font-semibold mb-1">3120 Purdue Avenue</h4>
          <p class="font-headline text-2xl text-amber-300 font-bold mb-2">$2,395,000</p>
          <p class="text-xs text-slate-400 font-light">Transacted over asking price with multiple backup offers. Represented Seller.</p>
        </div>

        <div class="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all duration-200">
          <div class="flex justify-between items-start mb-3">
            <span class="px-2.5 py-1 rounded bg-amber-300/20 text-amber-300 border border-amber-300/30 text-[10px] uppercase tracking-wider font-bold">
              Off-Market Private
            </span>
            <span class="text-[11px] text-slate-400 font-medium">Lakewood Proper</span>
          </div>
          <h4 class="font-headline text-xl text-white font-semibold mb-1">6521 Winton Street</h4>
          <p class="font-headline text-2xl text-amber-300 font-bold mb-2">$2,600,000</p>
          <p class="text-xs text-slate-400 font-light">Direct private buyer placement with strict confidentiality. Represented Buyer.</p>
        </div>

        <div class="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all duration-200">
          <div class="flex justify-between items-start mb-3">
            <span class="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-bold">
              Closed Record
            </span>
            <span class="text-[11px] text-slate-400 font-medium">Lakewood Historic</span>
          </div>
          <h4 class="font-headline text-xl text-white font-semibold mb-1">6234 Belmont Avenue</h4>
          <p class="font-headline text-2xl text-amber-300 font-bold mb-2">$1,850,000</p>
          <p class="text-xs text-slate-400 font-light">Pre-market cosmetic renovation orchestrated and sold in 4 days. Represented Seller.</p>
        </div>
      </div>
    </section>

    <!-- 6. MODERN VIP CONCIERGE CONSULTATION -->
    <section class="py-20 lg:py-28 max-w-4xl mx-auto px-5 lg:px-8" id="consultation">
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-3">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span class="text-[10px] uppercase tracking-widest text-slate-200 font-semibold">Priority Private Desk</span>
        </div>
        <h2 class="font-headline text-3xl sm:text-5xl text-white font-bold mb-3">Initiate Private Advisory</h2>
        <p class="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-light leading-relaxed">
          Discreet representation for estate acquisitions, structural forensics, and pre-market listing valuation across Dallas.
        </p>
      </div>

      <div class="p-8 sm:p-12 rounded-3xl bg-white/[0.06] border border-white/15 backdrop-blur-2xl shadow-2xl">
        <form @submit.prevent="emit('submitConsult')" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">Legal Name *</label>
              <input
                v-model="consultForm.fullName"
                required
                type="text"
                placeholder="Eleanor Vance"
                class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-300 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">Direct Email *</label>
              <input
                v-model="consultForm.email"
                required
                type="email"
                placeholder="name@domain.com"
                class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-300 transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">Telephone Number *</label>
              <input
                v-model="consultForm.phone"
                required
                type="tel"
                placeholder="214-000-0000"
                class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-300 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">Dallas Enclave of Interest</label>
              <select
                v-model="consultForm.neighborhood"
                class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-300 transition-colors"
              >
                <option value="park-cities" class="bg-slate-900">Park Cities (Highland Park / University Park)</option>
                <option value="preston-hollow" class="bg-slate-900">Preston Hollow & Estate Corridor</option>
                <option value="lakewood" class="bg-slate-900">Lakewood & Forest Hills</option>
                <option value="east-dallas" class="bg-slate-900">East Dallas / Lower Greenville</option>
                <option value="bluffview" class="bg-slate-900">Bluffview & Greenway Parks</option>
                <option value="uptown" class="bg-slate-900">Turtle Creek / Uptown</option>
                <option value="other" class="bg-slate-900">Other Greater Dallas Enclave</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">Advisory Scope</label>
            <select
              v-model="consultForm.objective"
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-300 transition-colors"
            >
              <option value="acquisition" class="bg-slate-900">Discreet Residence Acquisition</option>
              <option value="sale" class="bg-slate-900">Exclusive Listing Representation</option>
              <option value="renovation" class="bg-slate-900">Pre-Market Renovation Feasibility (0% upfront capital)</option>
              <option value="forensic" class="bg-slate-900">Structural / Foundation Forensic Review</option>
              <option value="portfolio-advisory" class="bg-slate-900">Family Office Real Estate Consultation</option>
            </select>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-slate-300 font-semibold mb-2">Confidential Brief / Property Details</label>
            <textarea
              v-model="consultForm.message"
              rows="3"
              placeholder="Provide any timing constraints, property addresses, or architectural requirements..."
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-300 transition-colors"
            ></textarea>
          </div>

          <button
            :disabled="isSubmittingConsult"
            type="submit"
            class="w-full py-4 rounded-xl bg-amber-300 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-200 shadow-xl flex items-center justify-center gap-2"
          >
            <span v-if="isSubmittingConsult" class="material-symbols-outlined animate-spin text-base">refresh</span>
            <span>{{ isSubmittingConsult ? 'TRANSMITTING PRIVATE DOSSIER...' : 'DISPATCH CONFIDENTIAL REQUEST' }}</span>
          </button>

          <div class="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-xs text-emerald-400">lock</span>
              Strict Confidentiality Protected
            </span>
            <span>·</span>
            <span>Avg Response &lt; 15 mins</span>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>
