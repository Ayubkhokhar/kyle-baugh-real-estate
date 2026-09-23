<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSiteSettings } from "../composables/useSiteSettings";
import { useInquiries } from "../composables/useInquiries";
import { useAgentResolver } from "../composables/useAgentResolver";

const router = useRouter();
const route = useRoute();
const { siteSettings } = useSiteSettings();
const { unreadCount } = useInquiries();
const { currentAgentId } = useAgentResolver();

const isDrawerOpen = ref(false);

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value;
}

function closeDrawer() {
  isDrawerOpen.value = false;
}

function navigateTo(hashOrPath) {
  closeDrawer();
  if (hashOrPath.startsWith("#")) {
    const isHome = ["/", "/kyle", "/amy", "/carson"].includes(route.path) || route.path.startsWith("/agent/");
    if (isHome) {
      const el = document.querySelector(hashOrPath);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      const basePath = currentAgentId.value === "kyle" ? "/kyle" : `/${currentAgentId.value}`;
      router.push(basePath + hashOrPath);
    }
  } else {
    router.push(hashOrPath);
  }
}
</script>

<template>
  <header
    class="bg-surface-alabaster/95 backdrop-blur-md text-primary sticky top-0 z-40 border-b border-border-subtle shadow-sm"
  >
    <div
      class="flex justify-between items-center w-full px-5 py-3.5 max-w-7xl mx-auto"
    >
      <!-- Brand & Mobile Drawer Trigger -->
      <div class="flex items-center gap-4">
        <button
          @click="toggleDrawer"
          aria-label="Toggle Navigation Drawer"
          class="p-1.5 -ml-1 text-primary hover:text-secondary transition-colors duration-150 flex items-center justify-center lg:hidden"
        >
          <span class="material-symbols-outlined text-2xl">menu</span>
        </button>

        <router-link :to="currentAgentId === 'kyle' ? '/kyle' : `/${currentAgentId}`" class="flex flex-col group text-left">
          <span
            class="font-headline text-xl sm:text-2xl tracking-widest uppercase text-primary font-bold"
          >
            {{ siteSettings.advisorName }}
          </span>
          <span
            class="text-[9px] tracking-[0.22em] text-charcoal-muted uppercase font-semibold"
          >
            {{ siteSettings.brokerage }}
          </span>
        </router-link>
      </div>

      <!-- Desktop Nav Links -->
      <nav class="hidden lg:flex items-center gap-7">
        <button
          @click="navigateTo('#portfolio')"
          class="text-xs uppercase tracking-wider text-primary font-semibold hover:text-secondary transition-colors duration-150"
        >
          Portfolio & Listings
        </button>
        <button
          @click="navigateTo('#construction')"
          class="text-xs uppercase tracking-wider text-charcoal-muted hover:text-secondary transition-colors duration-150"
        >
          {{ siteSettings.navAdvisoryLabel || siteSettings.pedigreeTag || 'Advisory Pedigree' }}
        </button>
        <button
          @click="navigateTo('#track-record')"
          class="text-xs uppercase tracking-wider text-charcoal-muted hover:text-secondary transition-colors duration-150"
        >
          Track Record
        </button>
        <button
          @click="navigateTo('#endorsements')"
          class="text-xs uppercase tracking-wider text-charcoal-muted hover:text-secondary transition-colors duration-150"
        >
          Endorsements
        </button>
        <router-link
          :to="currentAgentId === 'kyle' ? '/submit' : `/submit?agent=${currentAgentId}`"
          class="text-xs uppercase tracking-wider text-charcoal-muted hover:text-secondary transition-colors duration-150 flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-base">add_circle</span>
          <span>Submit Property</span>
        </router-link>
        <router-link
          :to="`/${currentAgentId}/manage`"
          class="text-xs uppercase tracking-wider text-charcoal-muted hover:text-secondary transition-colors duration-150 flex items-center gap-1.5"
        >
          <span class="material-symbols-outlined text-base">dashboard</span>
          <span>Management</span>
          <span
            v-if="unreadCount > 0"
            class="px-1.5 py-0.2 bg-secondary text-canvas-white text-[10px] rounded-full font-bold"
          >
            {{ unreadCount }}
          </span>
        </router-link>
      </nav>

      <!-- Trailing Action Button + Direct Contact -->
      <div class="flex items-center gap-5">
        <a
          :href="'tel:' + siteSettings.phoneTel"
          class="hidden xl:flex items-center gap-1.5 text-charcoal-body hover:text-secondary transition-colors duration-150"
        >
          <span class="material-symbols-outlined text-[17px] text-secondary">phone</span>
          <span class="text-xs tracking-widest font-semibold">{{ siteSettings.phone }}</span>
        </a>
        <button
          @click="navigateTo('#consultation')"
          class="text-xs uppercase tracking-widest px-4 py-2.5 bg-primary text-canvas-white hover:bg-secondary transition-colors duration-150 border border-primary rounded"
        >
          CONSULT
        </button>
      </div>
    </div>
  </header>

  <!-- ==================== NAVIGATION DRAWER (Slide-out) ==================== -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isDrawerOpen"
      @click="closeDrawer"
      class="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 transition-opacity"
    ></div>
  </Transition>

  <aside
    :class="[
      'fixed inset-y-0 left-0 w-80 max-w-full bg-surface-alabaster text-primary border-r border-border-subtle shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col justify-between p-6',
      isDrawerOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <div class="flex flex-col gap-6">
      <div class="flex justify-between items-center pb-4 border-b border-border-subtle">
        <div class="flex flex-col">
          <span class="font-headline text-lg tracking-widest uppercase text-primary font-bold">
            {{ siteSettings.advisorName }}
          </span>
          <span class="text-[9px] tracking-[0.2em] text-charcoal-muted font-semibold uppercase">
            {{ siteSettings.brokerage }}
          </span>
        </div>
        <button
          @click="closeDrawer"
          aria-label="Close navigation"
          class="p-1 hover:text-secondary transition-colors"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <!-- Profile Header Module in Drawer -->
      <div class="flex items-center gap-3 p-3 bg-surface-linen rounded border border-border-subtle">
        <div class="w-12 h-12 rounded-full overflow-hidden border border-border-brass shrink-0 bg-surface-linen">
          <img
            class="w-full h-full object-cover object-top"
            :src="siteSettings.headshot || '/images/compass/agent-headshot.webp'"
            :alt="siteSettings.advisorName"
          />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-semibold text-primary truncate">{{ siteSettings.advisorName }}</span>
          <span class="text-[10px] text-charcoal-muted truncate uppercase tracking-wider font-semibold">Premier Dallas Advisory</span>
          <span class="text-[11px] text-secondary tracking-tight">Park Cities · Preston Hollow · Lakewood</span>
        </div>
      </div>

      <!-- Drawer Nav Items -->
      <nav class="flex flex-col gap-1.5">
        <button
          @click="navigateTo('#portfolio')"
          class="flex items-center gap-3 px-3 py-2.5 bg-surface-linen text-primary rounded font-semibold border-l-2 border-border-brass text-left"
        >
          <span class="material-symbols-outlined text-secondary">apartment</span>
          <span class="text-xs uppercase tracking-wider font-semibold">Featured Residences</span>
        </button>
        <button
          @click="navigateTo('#construction')"
          class="flex items-center gap-3 px-3 py-2.5 text-charcoal-body rounded hover:bg-surface-linen transition-colors text-left"
        >
          <span class="material-symbols-outlined text-charcoal-muted">architecture</span>
          <span class="text-xs uppercase tracking-wider font-semibold">{{ siteSettings.navAdvisoryLabel || siteSettings.pedigreeTag || 'Advisory Pedigree' }}</span>
        </button>
        <button
          @click="navigateTo('#track-record')"
          class="flex items-center gap-3 px-3 py-2.5 text-charcoal-body rounded hover:bg-surface-linen transition-colors text-left"
        >
          <span class="material-symbols-outlined text-charcoal-muted">verified</span>
          <span class="text-xs uppercase tracking-wider font-semibold">Track Record</span>
        </button>
        <router-link
          :to="currentAgentId === 'kyle' ? '/submit' : `/submit?agent=${currentAgentId}`"
          @click="closeDrawer"
          class="flex items-center gap-3 px-3 py-2.5 text-charcoal-body rounded hover:bg-surface-linen transition-colors"
        >
          <span class="material-symbols-outlined text-charcoal-muted">add_business</span>
          <span class="text-xs uppercase tracking-wider font-semibold">Submit Listing</span>
        </router-link>
        <router-link
          :to="`/${currentAgentId}/manage`"
          @click="closeDrawer"
          class="flex items-center gap-3 px-3 py-2.5 text-charcoal-body rounded hover:bg-surface-linen transition-colors justify-between"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-charcoal-muted">admin_panel_settings</span>
            <span class="text-xs uppercase tracking-wider font-semibold">Management Console</span>
          </div>
          <span
            v-if="unreadCount > 0"
            class="px-2 py-0.5 bg-secondary text-canvas-white text-[10px] rounded-full font-bold"
          >
            {{ unreadCount }}
          </span>
        </router-link>
        <button
          @click="navigateTo('#consultation')"
          class="flex items-center gap-3 px-3 py-2.5 text-charcoal-body rounded hover:bg-surface-linen transition-colors text-left"
        >
          <span class="material-symbols-outlined text-charcoal-muted">mail</span>
          <span class="text-xs uppercase tracking-wider font-semibold">Private Consultation</span>
        </button>
      </nav>
    </div>

    <!-- Drawer Footer -->
    <div class="pt-6 border-t border-border-subtle flex flex-col gap-2">
      <div class="text-xs text-charcoal-muted uppercase tracking-widest font-semibold">Direct Advisory Line</div>
      <a
        :href="'tel:' + siteSettings.phoneTel"
        class="font-headline text-lg text-primary hover:text-secondary transition-colors"
      >
        {{ siteSettings.phone }}
      </a>
      <span class="text-xs text-charcoal-muted">{{ siteSettings.email }}</span>
    </div>
  </aside>
</template>
