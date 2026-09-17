<script setup>
import { useRoute, useRouter } from "vue-router";
import { useInquiries } from "../composables/useInquiries";

const route = useRoute();
const router = useRouter();
const { unreadCount } = useInquiries();

function navigate(target) {
  if (target.startsWith("#")) {
    if (route.path !== "/") {
      router.push("/" + target);
    } else {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  } else {
    router.push(target);
  }
}
</script>

<template>
  <nav
    class="lg:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 bg-surface-alabaster/95 backdrop-blur-md border-t border-border-subtle shadow-lg text-primary"
  >
    <!-- Tab 1: Home -->
    <button
      @click="navigate('/')"
      :class="[
        'flex flex-col items-center justify-center gap-1 transition-colors',
        route.path === '/' && !route.hash ? 'text-primary font-semibold' : 'text-charcoal-muted'
      ]"
    >
      <span class="material-symbols-outlined text-[22px]">real_estate_agent</span>
      <span class="text-[10px] uppercase tracking-wider">Advisory</span>
    </button>

    <!-- Tab 2: Listings -->
    <button
      @click="navigate('#portfolio')"
      class="flex flex-col items-center justify-center gap-1 text-charcoal-muted hover:text-secondary transition-colors"
    >
      <span class="material-symbols-outlined text-[22px]">domain</span>
      <span class="text-[10px] uppercase tracking-wider">Listings</span>
    </button>

    <!-- Tab 3: Submit -->
    <router-link
      to="/submit"
      :class="[
        'flex flex-col items-center justify-center gap-1 transition-colors',
        route.path === '/submit' ? 'text-primary font-semibold' : 'text-charcoal-muted'
      ]"
    >
      <span class="material-symbols-outlined text-[22px]">add_circle</span>
      <span class="text-[10px] uppercase tracking-wider">Submit</span>
    </router-link>

    <!-- Tab 4: Manage -->
    <router-link
      to="/manage"
      :class="[
        'flex flex-col items-center justify-center gap-1 transition-colors relative',
        route.path === '/manage' ? 'text-primary font-semibold' : 'text-charcoal-muted'
      ]"
    >
      <span class="material-symbols-outlined text-[22px]">admin_panel_settings</span>
      <span class="text-[10px] uppercase tracking-wider">Manage</span>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 right-2 w-4 h-4 bg-secondary text-canvas-white text-[9px] font-bold rounded-full flex items-center justify-center"
      >
        {{ unreadCount }}
      </span>
    </router-link>
  </nav>
</template>
