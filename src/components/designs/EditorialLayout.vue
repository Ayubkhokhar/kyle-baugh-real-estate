<script setup>
defineProps({
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
</script>

<template>
  <div class="editorial-design">
    <!-- HERO SECTION (CLASSIC EDITORIAL SPLIT) -->
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
                    class="w-full h-full object-cover object-top"
                    :src="siteSettings.headshot || '/images/compass/agent-headshot.webp'"
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
                      <p class="text-[11px] uppercase tracking-widest text-border-brass font-semibold">{{ siteSettings.title || 'Founder & Lead Advisor' }}</p>
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
            Architecturally vetted homes across Dallas's premier historic and estate corridors. Each property undergoes rigorous structural and market feasibility appraisal.
          </p>
        </div>

        <!-- Filter & Search Bar -->
        <div class="space-y-4 pb-8 mb-8 border-b border-border-subtle">
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="emit('update:activeCategory', cat.id)"
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
                :value="searchQuery"
                @input="emit('update:searchQuery', $event.target.value)"
                type="text"
                aria-label="Search properties by address, architectural style, or enclave"
                placeholder="Search by address, architectural style, or enclave..."
                class="w-full pl-9 pr-4 py-2 text-xs bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
              />
            </div>
            <div class="sm:w-60">
              <select
                :value="maxPrice"
                @change="emit('update:maxPrice', Number($event.target.value))"
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
            @click="emit('update:activeCategory', 'all'); emit('update:searchQuery', ''); emit('update:maxPrice', 0);"
            class="mt-4 px-5 py-2 bg-primary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-secondary transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </section>

    <!-- ADVISORY & PEDIGREE SECTION -->
    <section class="py-20 lg:py-28 bg-surface-alabaster border-b border-border-subtle relative" id="construction">
      <div class="max-w-7xl mx-auto px-5 lg:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-6 relative">
            <div class="relative bg-canvas-white p-3 border border-border-subtle shadow-lg">
              <div class="aspect-[4/3] bg-surface-linen overflow-hidden relative">
                <img
                  class="w-full h-full object-cover"
                  :src="siteSettings.pedigreeImage || '/images/compass/2007-euclid-avenue-cover.webp'"
                  :alt="siteSettings.advisorName + ' - Architectural Advisory'"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div class="mt-3 p-4 bg-surface-linen border border-border-subtle flex items-start gap-4">
                <span class="material-symbols-outlined text-secondary text-2xl mt-0.5">verified</span>
                <div>
                  <p class="font-semibold text-primary text-sm">{{ siteSettings.pedigreeBadgeTitle || 'Institutional Advisory Foundation' }}</p>
                  <p class="text-xs text-charcoal-muted leading-relaxed">
                    {{ siteSettings.pedigreeBadgeText }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="lg:col-span-6 flex flex-col space-y-6">
            <div class="flex items-center gap-2">
              <span class="w-6 h-[1px] bg-secondary"></span>
              <span class="text-xs text-secondary uppercase tracking-widest font-semibold">{{ siteSettings.pedigreeTag || 'Advisory Pedigree' }}</span>
            </div>
            <h2 class="font-headline text-3xl sm:text-4xl text-primary leading-tight">
              {{ siteSettings.pedigreeHeading }}
            </h2>
            <p class="text-base text-charcoal-body font-light leading-relaxed">
              {{ siteSettings.pedigreeBio }}
            </p>
            <div class="space-y-4 pt-2">
              <div
                v-for="(point, pIdx) in siteSettings.pedigreePoints"
                :key="pIdx"
                class="p-4 bg-canvas-white border border-border-subtle flex gap-4 shadow-sm"
              >
                <div class="w-10 h-10 bg-surface-linen border border-border-brass flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-primary text-xl">{{ point.icon }}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-primary text-sm">{{ point.title }}</h3>
                  <p class="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    {{ point.desc }}
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
          <h2 class="font-headline text-3xl sm:text-4xl text-primary">{{ siteSettings.endorsementsTitle || 'Uncompromising Advocacy' }}</h2>
          <p class="text-xs text-charcoal-muted mt-2 leading-relaxed">
            {{ siteSettings.endorsementsSubheading || 'Read first-hand accounts from high-net-worth Dallas families and clients.' }}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12" v-if="siteSettings.endorsements && siteSettings.endorsements.length > 0">
          <div
            v-for="(review, rIdx) in siteSettings.endorsements"
            :key="rIdx"
            class="bg-canvas-white p-8 lg:p-10 border border-border-subtle flex flex-col justify-between shadow-sm"
          >
            <div>
              <div class="flex items-center gap-1 text-secondary mb-6">
                <span v-for="i in (review.stars || 5)" :key="i" class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
              </div>
              <p class="font-headline text-lg sm:text-xl text-primary mb-4 italic leading-snug">
                "{{ review.quote }}"
              </p>
              <p class="text-xs text-charcoal-body font-light leading-relaxed">
                {{ review.story }}
              </p>
            </div>
            <div class="pt-6 mt-6 border-t border-border-subtle flex items-center justify-between">
              <div>
                <p class="font-semibold text-primary text-sm">{{ review.author }}</p>
                <p class="text-[10px] text-charcoal-muted uppercase tracking-wider">{{ review.location }}</p>
              </div>
              <span class="text-[10px] px-2.5 py-1 bg-surface-linen border border-border-subtle text-secondary uppercase font-semibold">{{ review.role }}</span>
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
          <form @submit.prevent="emit('submitConsult')" class="space-y-6">
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
