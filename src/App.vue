<script setup>
import { ref, watchEffect } from "vue";
import HeaderNav from "./components/HeaderNav.vue";
import FooterNav from "./components/FooterNav.vue";
import MobileBottomNav from "./components/MobileBottomNav.vue";
import ToastNotification from "./components/ToastNotification.vue";
import TemplateSwitcher from "./components/TemplateSwitcher.vue";
import { useSiteSettings } from "./composables/useSiteSettings";
import { useThemeTemplate } from "./composables/useThemeTemplate";

const { siteSettings } = useSiteSettings();
const { currentTemplate } = useThemeTemplate();
const toastRef = ref(null);

function handleToast(message, type = "success") {
  if (toastRef.value) {
    toastRef.value.show(message, type);
  }
}

// Dynamically update document head title and meta tags based on active agent
watchEffect(() => {
  if (typeof document !== "undefined") {
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
  <div class="min-h-screen flex flex-col bg-surface-alabaster text-charcoal-body transition-colors duration-300">
    <HeaderNav />
    
    <main class="flex-grow">
      <router-view @toast="handleToast" />
    </main>

    <FooterNav />
    <MobileBottomNav />

    <TemplateSwitcher @toast="handleToast" />
    <ToastNotification ref="toastRef" />
  </div>
</template>
