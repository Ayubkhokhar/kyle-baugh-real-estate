<script setup>
import { ref, computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import HeaderNav from "./components/HeaderNav.vue";
import FooterNav from "./components/FooterNav.vue";
import MobileBottomNav from "./components/MobileBottomNav.vue";
import ToastNotification from "./components/ToastNotification.vue";
import TemplateSwitcher from "./components/TemplateSwitcher.vue";
import { useSiteSettings } from "./composables/useSiteSettings";
import { useThemeTemplate } from "./composables/useThemeTemplate";

const route = useRoute();
const { siteSettings } = useSiteSettings();
const { currentTemplate } = useThemeTemplate();
const toastRef = ref(null);

const isSpecialView = computed(() => {
  const p = route?.path?.toLowerCase() || "";
  return p === "/" || p === "/login" || p === "/portal";
});

function handleToast(message, type = "success") {
  if (toastRef.value) {
    toastRef.value.show(message, type);
  }
}

// Dynamically update document head title and meta tags based on active agent
watchEffect(() => {
  if (typeof document !== "undefined") {
    const p = route?.path?.toLowerCase() || "";
    if (p === "/") {
      document.title = "Ayub Khokhar | Real Estate Websites & Business Automation Specialist";
      return;
    }
    if (p === "/login") {
      document.title = "Admin Login | Webpenter Real Estate Advisory";
      return;
    }
    if (p === "/portal") {
      document.title = "Master Control Suite | Webpenter Real Estate Advisory";
      return;
    }

    const name = siteSettings.value.advisorName || "Dallas Luxury Real Estate";
    const title = siteSettings.value.title || "Dallas Luxury Real Estate Advisory";
    document.title = `${name} | ${title}`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        `${name} · ${siteSettings.value.heroSubheading || "Premier Dallas luxury residences, architectural estates, and market advisory."}`
      );
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${name} | ${title}`);

    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) ogSiteName.setAttribute("content", `${name} Real Estate Advisory`);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && siteSettings.value.headshot) {
      ogImage.setAttribute("content", siteSettings.value.headshot);
    }
  }
});
</script>

<template>
  <div
    class="min-h-screen flex flex-col transition-colors duration-300"
    :class="{ 'bg-surface-alabaster text-charcoal-body': !isSpecialView, 'bg-slate-950 text-slate-100': isSpecialView }"
  >
    <!-- Agent Header (hidden on public Landing, Login, and Master Portal) -->
    <HeaderNav v-if="!isSpecialView" />
    
    <main class="flex-grow">
      <router-view @toast="handleToast" />
    </main>

    <!-- Agent Footer and Navigation (hidden on public Landing, Login, and Master Portal) -->
    <FooterNav v-if="!isSpecialView" />
    <MobileBottomNav v-if="!isSpecialView" />

    <TemplateSwitcher v-if="!isSpecialView" @toast="handleToast" />
    <ToastNotification ref="toastRef" />
  </div>
</template>
