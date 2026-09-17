<script setup>
import { ref } from "vue";

const isVisible = ref(false);
const message = ref("");
const type = ref("success"); // 'success' | 'error' | 'info'
let timer = null;

function show(msg, toastType = "success", duration = 3500) {
  message.value = msg;
  type.value = toastType;
  isVisible.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    isVisible.value = false;
  }, duration);
}

defineExpose({ show });
</script>

<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-50 max-w-md w-full bg-primary text-canvas-white p-4 rounded-md shadow-2xl border border-secondary flex items-start gap-3 backdrop-blur-md"
    >
      <span
        v-if="type === 'success'"
        class="material-symbols-outlined text-secondary text-2xl shrink-0"
        >check_circle</span
      >
      <span
        v-else-if="type === 'error'"
        class="material-symbols-outlined text-red-400 text-2xl shrink-0"
        >error</span
      >
      <span v-else class="material-symbols-outlined text-secondary text-2xl shrink-0"
        >info</span
      >
      <div class="flex-1 text-sm font-sans pr-2">
        <p class="font-medium leading-relaxed">{{ message }}</p>
      </div>
      <button
        @click="isVisible = false"
        class="text-charcoal-muted hover:text-canvas-white transition-colors"
      >
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  </Transition>
</template>
