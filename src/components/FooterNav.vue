<script setup>
import { computed } from "vue";
import { useSiteSettings } from "../composables/useSiteSettings";
import { useAgentResolver } from "../composables/useAgentResolver";

const { siteSettings } = useSiteSettings();
const { currentAgentId } = useAgentResolver();
const currentYear = new Date().getFullYear();
const basePath = computed(() => (currentAgentId.value === "kyle" ? "/kyle" : `/${currentAgentId.value}`));
</script>

<template>
  <footer class="bg-primary text-canvas-white pt-16 pb-24 md:pb-16 border-t border-border-subtle">
    <div class="max-w-7xl mx-auto px-5 lg:px-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-charcoal-body/40">
        <!-- Brand & Advisory Authority Column -->
        <div class="lg:col-span-4 space-y-4">
          <span class="font-headline text-2xl tracking-widest text-canvas-white block font-bold">
            {{ siteSettings.advisorName }}
          </span>
          <span class="text-xs tracking-[0.2em] text-border-brass block uppercase font-semibold">
            {{ siteSettings.brokerage }}
          </span>
          <p class="text-xs text-on-primary-container max-w-sm pt-2 leading-relaxed">
            {{ siteSettings.footerBio || "An independent, high-equity residential real estate advisory providing fiduciary-level representation throughout Dallas's premier enclaves." }}
          </p>
          <div class="pt-2 text-border-brass text-xs tracking-widest uppercase font-semibold">
            {{ siteSettings.licenseInfo }}
          </div>
        </div>

        <!-- Neighborhood Enclaves Column -->
        <div class="lg:col-span-3 space-y-3">
          <p class="text-xs text-border-brass uppercase tracking-widest font-semibold mb-4">
            Dallas Core Enclaves
          </p>
          <ul class="space-y-2 text-xs text-on-primary-container">
            <li><router-link :to="basePath + '#portfolio'" class="hover:text-canvas-white transition-colors">Park Cities (Highland & University Park)</router-link></li>
            <li><router-link :to="basePath + '#portfolio'" class="hover:text-canvas-white transition-colors">Preston Hollow & Estate Corridor</router-link></li>
            <li><router-link :to="basePath + '#portfolio'" class="hover:text-canvas-white transition-colors">Lakewood & White Rock Lake</router-link></li>
            <li><router-link :to="basePath + '#portfolio'" class="hover:text-canvas-white transition-colors">East Dallas & Lower Greenville</router-link></li>
            <li><router-link :to="basePath + '#portfolio'" class="hover:text-canvas-white transition-colors">Swiss Avenue Historic District</router-link></li>
            <li><router-link :to="basePath + '#portfolio'" class="hover:text-canvas-white transition-colors">Bluffview & Devonshire</router-link></li>
          </ul>
        </div>

        <!-- Advisory Disciplines Column -->
        <div class="lg:col-span-3 space-y-3">
          <p class="text-xs text-border-brass uppercase tracking-widest font-semibold mb-4">
            Brokerage Disciplines
          </p>
          <ul class="space-y-2 text-xs text-on-primary-container">
            <li><router-link :to="basePath + '#construction'" class="hover:text-canvas-white transition-colors">{{ siteSettings.navAdvisoryLabel || siteSettings.pedigreeTag || 'Advisory Pedigree' }}</router-link></li>
            <li><router-link :to="basePath + '#construction'" class="hover:text-canvas-white transition-colors">Concierge 0% Pre-Listing Capital</router-link></li>
            <li><router-link :to="basePath + '#portfolio'" class="hover:text-canvas-white transition-colors">Off-Market Private Acquisitions</router-link></li>
            <li><router-link :to="currentAgentId === 'kyle' ? '/submit' : `/submit?agent=${currentAgentId}`" class="hover:text-canvas-white transition-colors">Comparative CMA & Equity Valuation</router-link></li>
            <li><router-link :to="basePath + '#track-record'" class="hover:text-canvas-white transition-colors">Landmark Historic Restoration Oversight</router-link></li>
          </ul>
        </div>

        <!-- Direct Office Information -->
        <div class="lg:col-span-2 space-y-3">
          <p class="text-xs text-border-brass uppercase tracking-widest font-semibold mb-4">
            Direct Contact
          </p>
          <div class="space-y-2 text-xs text-on-primary-container">
            <p class="text-canvas-white font-medium">{{ siteSettings.officeAddress }}</p>
            <p class="pt-2">
              <a :href="'tel:' + siteSettings.phoneTel" class="hover:text-canvas-white transition-colors font-semibold">
                {{ siteSettings.phone }}
              </a>
            </p>
            <p>
              <a :href="'mailto:' + siteSettings.email" class="hover:text-canvas-white transition-colors">
                {{ siteSettings.email }}
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- Legal Disclaimers & Mandatory TREC Links -->
      <div class="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-on-primary-container text-xs">
        <div class="space-y-2 text-center md:text-left">
          <p>
            {{ siteSettings.brokerage }} is an independent Texas licensed real estate brokerage firm. Strictly unaffiliated with third-party multi-agent conglomerates.
          </p>
          <p class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-border-brass">
            <a href="https://www.trec.texas.gov" target="_blank" rel="noopener" class="underline hover:text-canvas-white transition-colors">
              Texas Real Estate Commission Consumer Protection Notice
            </a>
            <span>·</span>
            <a href="https://www.trec.texas.gov" target="_blank" rel="noopener" class="underline hover:text-canvas-white transition-colors">
              TREC Information About Brokerage Services (IABS)
            </a>
            <span>·</span>
            <span>Equal Housing Opportunity</span>
          </p>
        </div>
        <div class="text-center md:text-right text-[10px] tracking-widest text-on-primary-container uppercase">
          © {{ currentYear }} {{ siteSettings.brokerage }}. All Rights Reserved.
        </div>
      </div>
    </div>
  </footer>
</template>
