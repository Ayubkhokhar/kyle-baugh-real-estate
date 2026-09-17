<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  isOpen: Boolean,
  images: {
    type: Array,
    default: () => [],
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["close"]);

const currentIndex = ref(props.initialIndex);

watch(
  () => props.initialIndex,
  (val) => {
    currentIndex.value = val;
  }
);

function next() {
  if (props.images.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
}

function prev() {
  if (props.images.length === 0) return;
  currentIndex.value =
    (currentIndex.value - 1 + props.images.length) % props.images.length;
}

function handleKeydown(e) {
  if (!props.isOpen) return;
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
  if (e.key === "Escape") emit("close");
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen && images.length > 0"
      class="fixed inset-0 z-50 bg-primary/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none"
    >
      <!-- Top Bar -->
      <div class="flex items-center justify-between text-canvas-white z-10 pb-4 border-b border-charcoal-muted/30">
        <div>
          <span class="text-xs uppercase tracking-widest text-border-brass font-semibold">
            Architectural Photography
          </span>
          <span class="text-xs text-charcoal-muted ml-3">
            {{ currentIndex + 1 }} / {{ images.length }}
          </span>
        </div>
        <button
          @click="emit('close')"
          class="p-2 rounded-full hover:bg-canvas-white/10 text-canvas-white transition-colors"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      <!-- Main Stage -->
      <div class="relative flex-1 flex items-center justify-center min-h-0 my-4">
        <!-- Prev Button -->
        <button
          @click="prev"
          class="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-primary/60 hover:bg-primary text-canvas-white border border-border-brass/40 transition-colors"
        >
          <span class="material-symbols-outlined text-2xl">arrow_back</span>
        </button>

        <!-- Current Image -->
        <div class="max-w-5xl max-h-full flex flex-col items-center justify-center p-2">
          <img
            :src="images[currentIndex]?.url || images[currentIndex]"
            :alt="images[currentIndex]?.title || 'Property Photograph'"
            class="max-h-[68vh] w-auto max-w-full object-contain rounded-md shadow-2xl border border-charcoal-muted/20"
          />
          <div v-if="images[currentIndex]?.title || images[currentIndex]?.caption" class="text-center mt-3 max-w-2xl">
            <h4 class="font-headline text-lg text-canvas-white">
              {{ images[currentIndex]?.title }}
            </h4>
            <p class="text-xs text-charcoal-muted mt-1 leading-relaxed">
              {{ images[currentIndex]?.caption }}
            </p>
          </div>
        </div>

        <!-- Next Button -->
        <button
          @click="next"
          class="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-primary/60 hover:bg-primary text-canvas-white border border-border-brass/40 transition-colors"
        >
          <span class="material-symbols-outlined text-2xl">arrow_forward</span>
        </button>
      </div>

      <!-- Thumbnail Strip -->
      <div class="flex items-center justify-center gap-2 overflow-x-auto pt-2 max-w-4xl mx-auto w-full custom-scrollbar">
        <button
          v-for="(img, idx) in images"
          :key="idx"
          @click="currentIndex = idx"
          :class="[
            'w-16 h-12 rounded overflow-hidden border transition-all shrink-0',
            currentIndex === idx
              ? 'border-secondary ring-2 ring-secondary/50 scale-105'
              : 'border-charcoal-muted/40 opacity-60 hover:opacity-100'
          ]"
        >
          <img
            :src="img.url || img"
            class="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  </Transition>
</template>
