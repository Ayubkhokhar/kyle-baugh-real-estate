<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useProperties } from "../composables/useProperties";
import { useSiteSettings } from "../composables/useSiteSettings";
import { useInquiries } from "../composables/useInquiries";

const router = useRouter();
const { properties } = useProperties();
const { siteSettings } = useSiteSettings();
const { addInquiry } = useInquiries();

const emit = defineEmits(["toast"]);

const activeCategory = ref("all");
const searchQuery = ref("");
const maxPrice = ref(0);

const categories = [
  { id: "all", label: "All Residences" },
  { id: "active", label: "Active Exclusives" },
  { id: "sold", label: "Closed Track Record" },
  { id: "park-cities", label: "Park Cities" },
  { id: "lakewood", label: "Lakewood & East Dallas" },
  { id: "midway-hollow", label: "Midway Hollow" },
  { id: "historic", label: "Historic Landmarks" },
];

const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    if (activeCategory.value === "active") {
      if (!p.status?.includes("Active")) return false;
    } else if (activeCategory.value === "sold") {
      if (!p.status?.includes("Sold") && !p.status?.includes("Leased")) return false;
    } else if (activeCategory.value === "park-cities") {
      if (p.enclaveCategory !== "park-cities" && !p.neighborhood.includes("Park Cities") && !p.neighborhood.includes("Preston Hollow")) return false;
    } else if (activeCategory.value === "lakewood") {
      if (p.enclaveCategory !== "lakewood" && !p.neighborhood.includes("Lakewood") && !p.neighborhood.includes("Greenville") && !p.neighborhood.includes("East Dallas")) return false;
    } else if (activeCategory.value === "midway-hollow") {
      if (p.enclaveCategory !== "midway-hollow" && !p.neighborhood.includes("Midway")) return false;
    } else if (activeCategory.value === "historic") {
      if (p.enclaveCategory !== "historic" && !p.status?.includes("Historic") && p.yearBuilt > 1940) return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const match = p.title?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q) || p.neighborhood?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (maxPrice.value > 0 && p.price > maxPrice.value) return false;
    return true;
  });
});

const consultForm = ref({
  fullName: "",
  email: "",
  phone: "",
  neighborhood: "park-cities",
  objective: "acquisition",
  message: "",
});
const isSubmittingConsult = ref(false);

function handleConsultSubmit() {
  isSubmittingConsult.value = true;
  setTimeout(() => {
    addInquiry({
      name: consultForm.value.fullName,
      email: consultForm.value.email,
      phone: consultForm.value.phone,
      type: "Private Advisory Inquiry",
      neighborhood: consultForm.value.neighborhood,
      objective: consultForm.value.objective,
      message: consultForm.value.message || "Consultation requested from homepage.",
    });
    emit("toast", "Your confidential inquiry has been submitted to Kyle Baugh.", "success");
    consultForm.value = { fullName: "", email: "", phone: "", neighborhood: "park-cities", objective: "acquisition", message: "" };
    isSubmittingConsult.value = false;
  }, 400);
}
</script>

<template>
  <div>
    <!-- HERO SECTION -->
    <section class="relative bg-surface-alabaster border-b border-border-subtle overflow-hidden">
      <div class="absolute inset-0 opacity-40 pointer-events-none" style="background-image: radial-gradient(#D8C7B5 0.75px, transparent 0.75px); background-size: 24px 24px;"></div>
      <div class="relative max-w-7xl mx-auto px-5 lg:px-12 pt-12 lg:pt-20 pb-16 lg:pb-24">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-7 flex flex-col space-y-6">
            <div class="inline-flex items-center gap-2.5 px-3 py-1 bg-surface-linen border border-border-brass/70 w-fit rounded">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span class="text-xs tracking-widest uppercase font-semibold text-charcoal-body">Dallas Luxury Residential Advisory</span>
            </div>
            <h1 class="font-headline text-3xl sm:text-5xl lg:text-6xl text-primary tracking-tight leading-[1.15]">
              {{ siteSettings.heroHeading }}
            </h1>
            <p class="text-base sm:text-lg text-charcoal-muted max-w-2xl font-light leading-relaxed">
              {{ siteSettings.heroSubheading }}
            </p>
            <div class="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a href="#portfolio" class="px-7 py-4 bg-primary text-canvas-white text-xs uppercase tracking-widest text-center hover:bg-secondary transition-all duration-200 border border-primary font-semibold shadow-sm">
                Explore Active Portfolio
              </a>
              <router-link to="/submit" class="px-7 py-4 bg-transparent text-primary text-xs uppercase tracking-widest text-center hover:bg-surface-linen transition-all duration-200 border border-primary font-semibold">
                List Your Residence / Valuation
              </router-link>
            </div>
            <div class="pt-6 border-t border-border-subtle flex items-center gap-6">
              <div class="flex items-center gap-1 text-secondary">
                <span v-for="i in 5" :key="i" class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
              </div>
              <span class="text-xs text-charcoal-muted">5.0 Google & Verified Client Rating across Dallas County</span>
            </div>
          </div>
          <div class="lg:col-span-5 relative">
            <div class="relative mx-auto max-w-md lg:max-w-none">
              <div class="absolute -inset-3.5 border border-border-brass/80 rounded translate-x-2 translate-y-2 pointer-events-none hidden sm:block"></div>
              <div class="relative bg-canvas-white p-2.5 shadow-xl border border-border-subtle">
                <div class="relative aspect-[4/5] overflow-hidden bg-surface-linen">
                  <img
                    class="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAjYRx4css-T_-AENSBByIhtA1ar3h-k_YDrBx-q0I0TROujIGFVGNdJKUMkSWuarmqws42eeIs-XykO0t437gE720__boPCHG8giZD33unv4UuBcsiW5KTG-BKuAIjImAtBhkMhyRXohPFlTl_pYO5b_-iDsMjBqxvxuuymG-554tWTz9Isj4zRIMXmO6LoymP7wYyS6twqo0lzZEJjdOYmrolz-yjc0kZEd6cB_YvSBShcLeEG3Kzg"
                    :alt="siteSettings.advisorName + ' - Dallas Luxury Real Estate Advisor'"
                    fetchpriority="high"
                    width="400"
                    height="500"
                    decoding="async"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                  <div class="absolute bottom-4 left-4 right-4 text-canvas-white flex justify-between items-end">
                    <div>
                      <p class="font-headline text-xl text-canvas-white">{{ siteSettings.advisorName }}</p>
                      <p class="text-[11px] uppercase tracking-widest text-border-brass font-semibold">Founder & Lead Advisor</p>
                    </div>
                    <div class="px-2.5 py-1 bg-surface-alabaster/90 text-primary text-[10px] uppercase tracking-wider font-semibold border border-border-subtle backdrop-blur-sm">
                      D Magazine Best
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 4-Column Editorial Metric Strip -->
        <div class="mt-16 pt-10 border-t border-border-subtle">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div class="bg-canvas-white p-6 border border-border-subtle shadow-sm">
              <span class="block font-headline text-2xl sm:text-3xl text-primary font-medium">{{ siteSettings.stat1Value }}</span>
              <span class="block text-xs text-charcoal-muted uppercase tracking-widest mt-2 font-semibold">{{ siteSettings.stat1Label }}</span>
            </div>
            <div class="bg-canvas-white p-6 border border-border-subtle shadow-sm">
              <span class="block font-headline text-2xl sm:text-3xl text-primary font-medium">{{ siteSettings.stat2Value }}</span>
              <span class="block text-xs text-charcoal-muted uppercase tracking-widest mt-2 font-semibold">{{ siteSettings.stat2Label }}</span>
            </div>
            <div class="bg-canvas-white p-6 border border-border-subtle shadow-sm">
              <span class="block font-headline text-2xl sm:text-3xl text-primary font-medium">{{ siteSettings.stat3Value }}</span>
              <span class="block text-xs text-charcoal-muted uppercase tracking-widest mt-2 font-semibold">{{ siteSettings.stat3Label }}</span>
            </div>
            <div class="bg-canvas-white p-6 border border-border-subtle shadow-sm">
              <span class="block font-headline text-2xl sm:text-3xl text-primary font-medium">{{ siteSettings.stat4Value }}</span>
              <span class="block text-xs text-charcoal-muted uppercase tracking-widest mt-2 font-semibold">{{ siteSettings.stat4Label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- PORTFOLIO SECTION -->
    <section class="py-20 lg:py-28 bg-canvas-white border-b border-border-subtle" id="portfolio">
      <div class="max-w-7xl mx-auto px-5 lg:px-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-[1px] bg-secondary"></span>
              <span class="text-xs text-secondary uppercase tracking-widest font-semibold">Dallas Portfolio</span>
            </div>
            <h2 class="font-headline text-3xl sm:text-4xl text-primary">Featured Residences & Enclaves</h2>
          </div>
          <p class="text-sm text-charcoal-muted max-w-md leading-relaxed">
            Architecturally vetted homes across Dallas\'s premier historic and estate corridors. Each property undergoes rigorous structural and market feasibility appraisal.
          </p>
        </div>

        <!-- Filter & Search Bar -->
        <div class="space-y-4 pb-8 mb-8 border-b border-border-subtle">
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              :class="[
                'px-4 py-2 text-xs uppercase tracking-wider transition-colors rounded font-semibold',
                activeCategory === cat.id
                  ? 'bg-primary text-canvas-white'
                  : 'bg-surface-linen text-charcoal-body hover:bg-surface-alabaster border border-border-subtle'
              ]"
            >
              {{ cat.label }}
            </button>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-2.5 text-charcoal-muted text-lg">search</span>
              <input
                v-model="searchQuery"
                type="text"
                aria-label="Search properties by address, architectural style, or enclave"
                placeholder="Search by address, architectural style, or enclave..."
                class="w-full pl-9 pr-4 py-2 text-xs bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
              />
            </div>
            <div class="sm:w-60">
              <select
                v-model.number="maxPrice"
                aria-label="Filter residences by maximum price"
                class="w-full px-3 py-2 text-xs bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
              >
                <option :value="0">All Price Points</option>
                <option :value="1000000">Up to $1,000,000</option>
                <option :value="2500000">Up to $2,500,000</option>
                <option :value="5000000">Up to $5,000,000</option>
                <option :value="10000000">Up to $10,000,000</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Property Grid -->
        <div v-if="filteredProperties.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <article
            v-for="prop in filteredProperties"
            :key="prop.id"
            class="group bg-surface-alabaster border border-border-subtle hover:border-border-brass transition-all duration-300 flex flex-col shadow-sm"
          >
            <div class="relative aspect-[16/11] overflow-hidden bg-surface-linen">
              <img
                :src="prop.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'"
                :alt="prop.title + ' - ' + prop.neighborhood"
                loading="lazy"
                decoding="async"
                width="400"
                height="275"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div class="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
                <span
                  :class="[
                    'px-2.5 py-1 backdrop-blur-sm text-[10px] uppercase tracking-wider font-semibold border',
                    prop.status === 'Active Exclusive' ? 'bg-canvas-white/95 text-status-active border-border-subtle shadow-sm' :
                    prop.status === 'Private Exclusive' ? 'bg-primary text-canvas-white border-border-brass' :
                    prop.status === 'Pending' ? 'bg-secondary text-canvas-white border-secondary' :
                    prop.status === 'Sold Portfolio' ? 'bg-charcoal-body/90 text-canvas-white border-charcoal-body' :
                    prop.status === 'Leased' ? 'bg-primary/90 text-canvas-white border-primary' :
                    'bg-charcoal-body text-canvas-white border-charcoal-body'
                  ]"
                >
                  {{ prop.status }}
                </span>
                <span
                  v-if="prop.isCompassListing"
                  class="px-2 py-1 bg-surface-linen/90 backdrop-blur-sm text-primary text-[10px] uppercase tracking-wider font-semibold border border-border-brass/70 inline-flex items-center gap-1 shadow-sm"
                >
                  <span class="material-symbols-outlined text-[12px] text-secondary">verified</span>
                  Compass
                </span>
                <span
                  v-if="prop.openHouse"
                  class="px-2.5 py-1 bg-primary/90 backdrop-blur-sm text-canvas-white text-[10px] uppercase tracking-wider font-semibold"
                >
                  {{ prop.openHouse }}
                </span>
              </div>
            </div>

            <div class="p-6 flex flex-col flex-grow justify-between">
              <div>
                <p class="font-headline text-2xl text-primary font-medium mb-1">
                  {{ prop.priceFormatted }}
                </p>
                <h3 class="font-headline text-xl text-primary mb-1 group-hover:text-secondary transition-colors">
                  {{ prop.title }}
                </h3>
                <p class="text-xs uppercase tracking-widest text-charcoal-muted font-semibold mb-3">
                  {{ prop.neighborhood }}
                </p>
                <p class="text-xs text-charcoal-body mb-4 font-light line-clamp-2 leading-relaxed">
                  {{ prop.tagline || prop.description }}
                </p>
              </div>

              <div class="pt-4 border-t border-border-subtle">
                <div class="flex items-center justify-between text-charcoal-muted text-xs">
                  <span>{{ prop.bedrooms }} Beds</span>
                  <span class="text-border-brass">|</span>
                  <span>{{ prop.bathrooms }} Baths</span>
                  <span class="text-border-brass">|</span>
                  <span>{{ prop.sqft?.toLocaleString() }} Sq Ft</span>
                  <span class="text-border-brass">|</span>
                  <span>{{ prop.lotSize }}</span>
                </div>

                <router-link
                  :to="'/property/' + prop.id"
                  class="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary hover:text-secondary transition-colors font-semibold"
                >
                  View Residence Dossier
                  <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                </router-link>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="text-center py-16 bg-surface-linen border border-border-subtle rounded p-8">
          <span class="material-symbols-outlined text-4xl text-charcoal-muted mb-2">home_work</span>
          <p class="font-headline text-xl text-primary">No residences match your filter criteria.</p>
          <p class="text-xs text-charcoal-muted mt-1">Try expanding your price range or clearing the enclave filter.</p>
          <button
            @click="activeCategory = 'all'; searchQuery = ''; maxPrice = 0;"
            class="mt-4 px-5 py-2 bg-primary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-secondary transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </section>
    <!-- CONSTRUCTION SECTION -->
    <section class="py-20 lg:py-28 bg-surface-alabaster border-b border-border-subtle relative" id="construction">
      <div class="max-w-7xl mx-auto px-5 lg:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-6 relative">
            <div class="relative bg-canvas-white p-3 border border-border-subtle shadow-lg">
              <div class="aspect-[4/3] bg-surface-linen overflow-hidden relative">
                <img
                  class="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0TjsYGkE-EuLYqK9GfMImfBFfz1a1GpwvMaQ-u0iXCX54-2zB8wxKqPjccANw9si801E5Er6py5jvwquhj6LQwYnz6QxMGaa-BIP4NznMoJ7qxULr6tGg4JM95DVfiHAFhu-YdMAJxpKWYhBn094pYJZYA9lV6ehL3F7himl4jw-RqtpK9Hmnj_jg06u8Szd6T4wf6VetngNMNAUPxF9ed8MOKtwTXfopC83o0LVwWfZyTggcBFTHrQ"
                  alt="Kyle Baugh On-Site Construction Forensics"
                />
              </div>
              <div class="mt-3 p-4 bg-surface-linen border border-border-subtle flex items-start gap-4">
                <span class="material-symbols-outlined text-secondary text-2xl mt-0.5">architecture</span>
                <div>
                  <p class="font-semibold text-primary text-sm">Institutional Construction Foundation</p>
                  <p class="text-xs text-charcoal-muted leading-relaxed">
                    Bachelor of Science in Construction Science, University of Oklahoma. Former manager of NASA flight facilities and Dallas Love Field infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-6 flex flex-col space-y-6">
            <div class="flex items-center gap-2">
              <span class="w-6 h-[1px] bg-secondary"></span>
              <span class="text-xs text-secondary uppercase tracking-widest font-semibold">Construction Pedigree</span>
            </div>
            <h2 class="font-headline text-3xl sm:text-4xl text-primary leading-tight">
              Structural Precision Meets Dallas Real Estate Discretion.
            </h2>
            <p class="text-base text-charcoal-body font-light leading-relaxed">
              Most Dallas agents view properties through paint colors and staging. With a formal degree in Construction Science and years leading multi-million-dollar commercial projects, Kyle deconstructs each home down to its concrete pilings, beam deflections, and mechanical lifespan.
            </p>
            <div class="space-y-4 pt-2">
              <div class="p-4 bg-canvas-white border border-border-subtle flex gap-4 shadow-sm">
                <div class="w-10 h-10 bg-surface-linen border border-border-brass flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-primary text-xl">foundation</span>
                </div>
                <div>
                  <h3 class="font-semibold text-primary text-sm">Pier & Beam / Crawlspace Structural Forensics</h3>
                  <p class="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    Dallas\'s shifting Blackland Prairie soils demand relentless scrutiny. We audit subflooring, moisture barriers, and pier settlement before writing or accepting offers.
                  </p>
                </div>
              </div>
              <div class="p-4 bg-canvas-white border border-border-subtle flex gap-4 shadow-sm">
                <div class="w-10 h-10 bg-surface-linen border border-border-brass flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-primary text-xl">payments</span>
                </div>
                <div>
                  <h3 class="font-semibold text-primary text-sm">Concierge Pre-Sale Renovation Capital (0% Upfront)</h3>
                  <p class="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    Kyle coordinates, scopes, and front-funds strategic aesthetic renovations—recouped strictly at closing with zero out-of-pocket interest to maximize your sale net.
                  </p>
                </div>
              </div>
              <div class="p-4 bg-canvas-white border border-border-subtle flex gap-4 shadow-sm">
                <div class="w-10 h-10 bg-surface-linen border border-border-brass flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-primary text-xl">lock</span>
                </div>
                <div>
                  <h3 class="font-semibold text-primary text-sm">Off-Market Syndication & Private Discretion</h3>
                  <p class="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    Over 35% of Kyle\'s transaction volume trades completely off-MLS through direct family office networks, safeguarding privacy and avoiding public speculation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TRACK RECORD SECTION -->
    <section class="py-20 lg:py-28 bg-canvas-white border-b border-border-subtle" id="track-record">
      <div class="max-w-7xl mx-auto px-5 lg:px-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-6 h-[1px] bg-secondary"></span>
              <span class="text-xs text-secondary uppercase tracking-widest font-semibold">Verified Track Record</span>
            </div>
            <h2 class="font-headline text-3xl sm:text-4xl text-primary">Selected Landmark Past Closings</h2>
          </div>
          <div class="text-right">
            <span class="font-headline text-3xl sm:text-4xl text-primary font-medium">$100M+</span>
            <span class="block text-xs text-charcoal-muted uppercase tracking-widest font-semibold">Career Dallas Sales Volume</span>
          </div>
        </div>

        <div class="border border-border-subtle bg-surface-alabaster divide-y divide-border-subtle">
          <div class="p-5 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-canvas-white transition-colors duration-150">
            <div class="md:col-span-4">
              <span class="font-headline text-lg text-primary block">3120 Purdue Avenue</span>
              <span class="text-xs text-charcoal-muted uppercase tracking-wider font-semibold">University Park / Park Cities</span>
            </div>
            <div class="md:col-span-3">
              <span class="text-xs text-charcoal-body font-medium">Transacted in 8 Days Over Asking</span>
              <span class="text-xs text-charcoal-muted block">Represented Seller</span>
            </div>
            <div class="md:col-span-3">
              <span class="font-headline text-xl text-primary font-medium">$2,395,000</span>
              <span class="text-[10px] text-status-active tracking-wider uppercase font-semibold block">Closed & Recorded</span>
            </div>
            <div class="md:col-span-2 text-right">
              <span class="px-3 py-1 bg-surface-linen border border-border-subtle text-[10px] uppercase tracking-wider font-semibold text-charcoal-body">Historic UP</span>
            </div>
          </div>
          <div class="p-5 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-canvas-white transition-colors duration-150">
            <div class="md:col-span-4">
              <span class="font-headline text-lg text-primary block">6521 Winton Street</span>
              <span class="text-xs text-charcoal-muted uppercase tracking-wider font-semibold">Lakewood Proper</span>
            </div>
            <div class="md:col-span-3">
              <span class="text-xs text-charcoal-body font-medium">Off-Market Private Placement</span>
              <span class="text-xs text-charcoal-muted block">Represented Buyer</span>
            </div>
            <div class="md:col-span-3">
              <span class="font-headline text-xl text-primary font-medium">$2,600,000</span>
              <span class="text-[10px] text-status-active tracking-wider uppercase font-semibold block">Closed & Recorded</span>
            </div>
            <div class="md:col-span-2 text-right">
              <span class="px-3 py-1 bg-surface-linen border border-border-subtle text-[10px] uppercase tracking-wider font-semibold text-charcoal-body">Lakewood</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CLIENT ENDORSEMENTS -->
    <section class="py-20 lg:py-28 bg-surface-linen border-b border-border-subtle" id="endorsements">
      <div class="max-w-7xl mx-auto px-5 lg:px-12">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <div class="flex items-center justify-center gap-2 mb-2">
            <span class="w-6 h-[1px] bg-secondary"></span>
            <span class="text-xs text-secondary uppercase tracking-widest font-semibold">Client Endorsements</span>
            <span class="w-6 h-[1px] bg-secondary"></span>
          </div>
          <h2 class="font-headline text-3xl sm:text-4xl text-primary">Uncompromising Advocacy</h2>
          <p class="text-xs text-charcoal-muted mt-2 leading-relaxed">
            Read first-hand accounts from high-net-worth Dallas families and executives who relied on Kyle\'s construction-first model.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div class="bg-canvas-white p-8 lg:p-10 border border-border-subtle flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center gap-1 text-secondary mb-6">
                <span v-for="i in 5" :key="i" class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
              </div>
              <p class="font-headline text-lg sm:text-xl text-primary mb-4 italic leading-snug">
                "Kyle crawled under the pier-and-beam foundation on our first tour. He spotted a $45,000 subfloor structural deflection that two standard home inspectors completely overlooked."
              </p>
              <p class="text-xs text-charcoal-body font-light leading-relaxed">
                His construction science background saved us an enormous financial catastrophe in University Park. When we finally found our dream home, his contract tactics negotiated a $60,000 credit.
              </p>
            </div>
            <div class="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between">
              <div>
                <p class="font-semibold text-primary text-sm">David & Claire R.</p>
                <p class="text-[10px] text-charcoal-muted uppercase tracking-wider">Park Cities Homeowners</p>
              </div>
              <span class="text-[10px] px-2.5 py-1 bg-surface-linen border border-border-subtle text-secondary uppercase font-semibold">Verified Buyer</span>
            </div>
          </div>
          <div class="bg-canvas-white p-8 lg:p-10 border border-border-subtle flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center gap-1 text-secondary mb-6">
                <span v-for="i in 5" :key="i" class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
              </div>
              <p class="font-headline text-lg sm:text-xl text-primary mb-4 italic leading-snug">
                "Kyle front-funded and orchestrated a 3-week cosmetic overhaul on our Lakewood listing. We sold for $185,000 over our initial target in four days."
              </p>
              <p class="text-xs text-charcoal-body font-light leading-relaxed">
                His project management was surgical. Subcontractors showed up on time, finishes were executed to architectural spec, and his off-market syndication had buyers queuing.
              </p>
            </div>
            <div class="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between">
              <div>
                <p class="font-semibold text-primary text-sm">Matt S.</p>
                <p class="text-[10px] text-charcoal-muted uppercase tracking-wider">Lakewood Estate Seller</p>
              </div>
              <span class="text-[10px] px-2.5 py-1 bg-surface-linen border border-border-subtle text-secondary uppercase font-semibold">Verified Seller</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONSULTATION FORM -->
    <section class="py-20 lg:py-28 bg-surface-alabaster border-b border-border-subtle" id="consultation">
      <div class="max-w-4xl mx-auto px-5 lg:px-8">
        <div class="text-center mb-12">
          <div class="flex items-center justify-center gap-2 mb-2">
            <span class="w-6 h-[1px] bg-secondary"></span>
            <span class="text-xs text-secondary uppercase tracking-widest font-semibold">Confidential Inquiry</span>
            <span class="w-6 h-[1px] bg-secondary"></span>
          </div>
          <h2 class="font-headline text-3xl sm:text-4xl text-primary">Initiate Private Advisory</h2>
          <p class="text-xs text-charcoal-muted max-w-lg mx-auto mt-2 leading-relaxed">
            Whether contemplating the discreet acquisition of an estate, requesting a forensic structural valuation, or preparing a landmark listing.
          </p>
        </div>

        <div class="bg-canvas-white p-8 lg:p-12 border border-border-subtle shadow-xl rounded-lg">
          <form @submit.prevent="handleConsultSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="consult-name" class="block text-xs text-charcoal-body uppercase tracking-wider font-semibold mb-2">Full Legal Name *</label>
                <input id="consult-name" v-model="consultForm.fullName" required type="text" placeholder="Eleanor Vance" class="w-full bg-surface-alabaster border border-border-subtle px-4 py-3 text-sm text-primary focus:border-secondary focus:ring-0 rounded transition-colors"/>
              </div>
              <div>
                <label for="consult-email" class="block text-xs text-charcoal-body uppercase tracking-wider font-semibold mb-2">Private Email Address *</label>
                <input id="consult-email" v-model="consultForm.email" required type="email" placeholder="name@domain.com" class="w-full bg-surface-alabaster border border-border-subtle px-4 py-3 text-sm text-primary focus:border-secondary focus:ring-0 rounded transition-colors"/>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="consult-phone" class="block text-xs text-charcoal-body uppercase tracking-wider font-semibold mb-2">Direct Telephone Number *</label>
                <input id="consult-phone" v-model="consultForm.phone" required type="tel" placeholder="214-000-0000" class="w-full bg-surface-alabaster border border-border-subtle px-4 py-3 text-sm text-primary focus:border-secondary focus:ring-0 rounded transition-colors"/>
              </div>
              <div>
                <label for="consult-neighborhood" class="block text-xs text-charcoal-body uppercase tracking-wider font-semibold mb-2">Dallas Neighborhood</label>
                <select id="consult-neighborhood" v-model="consultForm.neighborhood" class="w-full bg-surface-alabaster border border-border-subtle px-4 py-3 text-sm text-primary focus:border-secondary focus:ring-0 rounded transition-colors">
                  <option value="park-cities">Park Cities (Highland Park / University Park)</option>
                  <option value="preston-hollow">Preston Hollow & Estate Area</option>
                  <option value="lakewood">Lakewood & Forest Hills</option>
                  <option value="east-dallas">East Dallas / Lower Greenville</option>
                  <option value="bluffview">Bluffview & Greenway Parks</option>
                  <option value="uptown">Turtle Creek / Uptown</option>
                  <option value="other">Other Greater Dallas Enclave</option>
                </select>
              </div>
            </div>
            <div>
              <label for="consult-objective" class="block text-xs text-charcoal-body uppercase tracking-wider font-semibold mb-2">Advisory Objective</label>
              <select id="consult-objective" v-model="consultForm.objective" class="w-full bg-surface-alabaster border border-border-subtle px-4 py-3 text-sm text-primary focus:border-secondary focus:ring-0 rounded transition-colors">
                <option value="acquisition">Discreet Residence Acquisition</option>
                <option value="sale">Exclusive Listing Representation</option>
                <option value="renovation">Pre-Market Renovation Feasibility (0% upfront capital)</option>
                <option value="forensic">Structural / Foundation Forensic Review</option>
                <option value="portfolio-advisory">Family Office Real Estate Consultation</option>
              </select>
            </div>
            <div>
              <label for="consult-message" class="block text-xs text-charcoal-body uppercase tracking-wider font-semibold mb-2">Confidential Portfolio Notes or Property Address</label>
              <textarea id="consult-message" v-model="consultForm.message" rows="4" placeholder="Detail any specific architectural requirements, timing parameters, or current property characteristics..." class="w-full bg-surface-alabaster border border-border-subtle px-4 py-3 text-sm text-primary focus:border-secondary focus:ring-0 rounded transition-colors"></textarea>
            </div>
            <div class="pt-2">
              <button :disabled="isSubmittingConsult" type="submit" class="w-full py-4 bg-primary text-canvas-white text-xs uppercase tracking-widest hover:bg-secondary transition-all duration-200 border border-primary font-semibold flex items-center justify-center gap-2">
                <span v-if="isSubmittingConsult" class="material-symbols-outlined animate-spin text-base">refresh</span>
                <span>{{ isSubmittingConsult ? 'TRANSMITTING ADVISORY DOSSIER...' : 'SUBMIT CONSULTATION REQUEST' }}</span>
              </button>
            </div>
            <p class="text-[11px] text-charcoal-muted text-center pt-2">
              Strict client confidentiality maintained. Your information is never syndicated or shared with third parties.
            </p>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
