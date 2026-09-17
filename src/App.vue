<script setup>
import { ref, onMounted } from "vue";
import HeaderNav from "./components/HeaderNav.vue";
import FooterNav from "./components/FooterNav.vue";
import MobileBottomNav from "./components/MobileBottomNav.vue";
import ToastNotification from "./components/ToastNotification.vue";
import { useSiteSettings } from "./composables/useSiteSettings";

const { siteSettings } = useSiteSettings();
const toastRef = ref(null);

onMounted(() => {
  if (siteSettings.value?.fontFamily && typeof document !== "undefined") {
    document.documentElement.style.setProperty("--font-headline", siteSettings.value.fontFamily);
  }
});

function handleToast(message, type = "success") {
  if (toastRef.value) {
    toastRef.value.show(message, type);
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-alabaster text-charcoal-body">
    <HeaderNav />
    
    <main class="flex-grow">
      <router-view @toast="handleToast" />
    </main>

    <FooterNav />
    <MobileBottomNav />

    <ToastNotification ref="toastRef" />
  </div>
</template>
