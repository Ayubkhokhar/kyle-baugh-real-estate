<script setup>
import { ref, onMounted } from "vue";
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
