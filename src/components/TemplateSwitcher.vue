<script setup>
import { ref } from "vue";
import { useThemeTemplate } from "../composables/useThemeTemplate";

const emit = defineEmits(["toast"]);
const { templates, currentTemplate, setTemplate, getShareUrl } = useThemeTemplate();

const isOpen = ref(false);

function handleSelect(id) {
  setTemplate(id);
  const matched = templates.find((t) => t.id === id);
  emit("toast", `Template switched to "${matched?.name}"`, "success");
}

function handleCopyLink(id) {
  const shareUrl = getShareUrl(id);
  navigator.clipboard.writeText(shareUrl);
  const matched = templates.find((t) => t.id === id);
  emit("toast", `Share link for "${matched?.name}" copied to clipboard!`, "info");
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50">
    <!-- Collapsed Trigger Button -->
    <div v-if="!isOpen" class="flex items-center">
      <button
        @click="isOpen = true"
        class="group flex items-center gap-2 px-3.5 py-2.5 bg-primary text-canvas-white rounded-full shadow-2xl border border-border-brass/40 hover:border-secondary hover:scale-105 transition-all duration-200"
        title="Switch Luxury Template Theme (A/B Testing)"
        aria-label="Toggle Luxury Theme Switcher"
      >
        <span class="material-symbols-outlined text-secondary text-lg group-hover:rotate-45 transition-transform duration-300">palette</span>
        <span class="text-xs uppercase tracking-wider font-semibold">Templates</span>
        <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: templates.find(t => t.id === currentTemplate)?.previewColor }"></span>
      </button>
    </div>

    <!-- Expanded Template Panel -->
    <div
      v-else
      class="bg-canvas-white/95 backdrop-blur-xl border border-border-brass/70 shadow-2xl rounded-xl p-4 w-80 text-primary transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary text-lg">palette</span>
          <div>
            <h4 class="font-headline text-sm font-semibold text-primary">Luxury Design Templates</h4>
            <span class="text-[10px] text-charcoal-muted uppercase tracking-wider block">A/B Testing Switcher</span>
          </div>
        </div>
        <button
          @click="isOpen = false"
          class="p-1 text-charcoal-muted hover:text-primary rounded"
          aria-label="Close template switcher"
        >
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <!-- 4 Template Options List -->
      <div class="space-y-2">
        <div
          v-for="t in templates"
          :key="t.id"
          @click="handleSelect(t.id)"
          :class="[
            'p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between group',
            currentTemplate === t.id
              ? 'border-secondary bg-surface-linen/70 ring-1 ring-secondary/50'
              : 'border-border-subtle hover:border-border-brass bg-surface-alabaster/40'
          ]"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-5 h-5 rounded-full border border-black/10 shrink-0 shadow-sm"
              :style="{ backgroundColor: t.previewColor }"
            ></span>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-semibold text-primary block leading-tight">{{ t.name }}</span>
                <span v-if="currentTemplate === t.id" class="text-[9px] px-1.5 py-0.2 bg-secondary text-canvas-white rounded font-bold uppercase">Active</span>
              </div>
              <span class="text-[10px] text-charcoal-muted line-clamp-1 mt-0.5">{{ t.tagline }}</span>
            </div>
          </div>

          <button
            @click.stop="handleCopyLink(t.id)"
            class="p-1.5 text-charcoal-muted hover:text-secondary rounded hover:bg-canvas-white/80 transition-colors"
            :title="'Copy direct URL for ' + t.name"
            aria-label="Copy template link"
          >
            <span class="material-symbols-outlined text-base">link</span>
          </button>
        </div>
      </div>

      <div class="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between text-[11px] text-charcoal-muted">
        <span>Target clients with <code class="text-[10px] bg-surface-linen px-1 rounded font-mono">?template=...</code></span>
        <button
          @click="handleCopyLink(currentTemplate)"
          class="text-secondary hover:underline font-semibold flex items-center gap-0.5"
        >
          <span>Copy URL</span>
          <span class="material-symbols-outlined text-xs">share</span>
        </button>
      </div>
    </div>
  </div>
</template>
