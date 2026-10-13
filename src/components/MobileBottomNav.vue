<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useInquiries } from "../composables/useInquiries";
import { useAgentResolver } from "../composables/useAgentResolver";
import { useSiteSettings } from "../composables/useSiteSettings";

const route = useRoute();
const router = useRouter();
const { unreadCount } = useInquiries();
const { currentAgentId, availableAgents } = useAgentResolver();
const { siteSettings } = useSiteSettings();

const shouldHide = computed(() => {
  if (route.meta?.hideAgentNav) return true;
  const rawPath = route?.path || (typeof window !== "undefined" ? window.location.pathname : "");
  const p = rawPath.toLowerCase().replace(/\/+$/, "") || "/";
  return p === "/" || p === "/login" || p === "/portal";
});

function navigate(target) {
  if (target.startsWith("#")) {
    const isHome = route.path === "/" || availableAgents.some((a) => route.path === `/${a.id}`) || route.path.startsWith("/agent/");
    if (isHome) {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      const basePath = currentAgentId.value === "kyle" ? "/kyle" : `/${currentAgentId.value}`;
      router.push(basePath + target);
    }
  } else {
    router.push(target);
  }
}
</script>

<template>
  <nav
    v-if="!shouldHide"
    class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-alabaster/95 backdrop-blur-xl border-t border-border-brass/40 shadow-2xl text-primary"
    style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px); padding-top: 6px;"
  >
    <div class="grid grid-cols-5 items-center max-w-md mx-auto px-2">
      <!-- Tab 1: Home / Advisory -->
      <button
        @click="navigate(currentAgentId === 'kyle' ? '/kyle' : `/${currentAgentId}`)"
        :class="[
          'flex flex-col items-center justify-center py-1 transition-all group',
          (route.path === '/' || route.path === `/${currentAgentId}`) && !route.hash ? 'text-primary font-bold' : 'text-charcoal-muted hover:text-primary'
        ]"
      >
        <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">real_estate_agent</span>
        <span class="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Advisory</span>
      </button>

      <!-- Tab 2: Listings -->
      <button
        @click="navigate('#portfolio')"
        class="flex flex-col items-center justify-center py-1 text-charcoal-muted hover:text-primary transition-all group"
      >
        <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">domain</span>
        <span class="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Listings</span>
      </button>

      <!-- Tab 3: Raised Call Button -->
      <a
        :href="'tel:' + (siteSettings.phoneTel || '12149803933')"
        class="flex flex-col items-center justify-center -mt-3.5 group"
        title="Direct Telephone"
      >
        <div class="w-11 h-11 rounded-full bg-primary text-canvas-white flex items-center justify-center shadow-lg border-2 border-border-brass group-hover:bg-secondary group-hover:scale-105 transition-all">
          <span class="material-symbols-outlined text-[20px]">phone</span>
        </div>
        <span class="text-[9px] uppercase tracking-wider font-bold text-primary mt-1">Call</span>
      </a>

      <!-- Tab 4: Direct Text / SMS -->
      <a
        :href="'sms:' + (siteSettings.phoneTel || '12149803933')"
        class="flex flex-col items-center justify-center py-1 text-charcoal-muted hover:text-primary transition-all group"
        title="Send SMS"
      >
        <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">sms</span>
        <span class="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Text</span>
      </a>

      <!-- Tab 5: Inquire / Consult -->
      <button
        @click="navigate('#consultation')"
        class="flex flex-col items-center justify-center py-1 text-charcoal-muted hover:text-primary transition-all group"
      >
        <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">edit_calendar</span>
        <span class="text-[9px] uppercase tracking-wider font-semibold mt-0.5">Inquire</span>
      </button>
    </div>
  </nav>
</template>
