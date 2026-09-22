<script setup>
import { ref } from "vue";
import { useThemeTemplate } from "../composables/useThemeTemplate";
import { useAgentResolver } from "../composables/useAgentResolver";

const emit = defineEmits(["toast"]);
const { templates, currentTemplate, setTemplate } = useThemeTemplate();
const { availableAgents, currentAgentId, setAgent, getAgentShareUrl } = useAgentResolver();

const isOpen = ref(false);

function handleSelectTheme(id) {
  setTemplate(id);
  const matched = templates.find((t) => t.id === id);
  emit("toast", `Color theme switched to "${matched?.name}"`, "success");
}

function handleSwitchAgent(agentId) {
  setAgent(agentId);
}

function getCombinedShareUrl(themeId) {
  if (typeof window === "undefined") return "";
  return getAgentShareUrl(currentAgentId.value, {
    template: themeId,
  });
}

async function handleCopyLink(themeId) {
  const url = getCombinedShareUrl(themeId || currentTemplate.value);
  try {
    await navigator.clipboard.writeText(url);
    const themeName = templates.find((t) => t.id === (themeId || currentTemplate.value))?.name;
    const agentName = availableAgents.find((a) => a.id === currentAgentId.value)?.name;
    emit("toast", `Copied share link for ${agentName} (${themeName})!`, "info");
  } catch (err) {
    emit("toast", "Link: " + url, "info");
  }
}
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50">
    <!-- Collapsed Floating Trigger Button -->
    <div v-if="!isOpen" class="flex items-center">
      <button
        @click="isOpen = true"
        class="group flex items-center gap-2.5 px-4 py-2.5 bg-primary text-canvas-white rounded-full shadow-2xl border border-border-brass/60 hover:border-secondary hover:scale-105 transition-all duration-200"
        title="Switch Layout Design & Luxury Palette (A/B Testing)"
        aria-label="Toggle Design & Theme Switcher"
      >
        <span class="material-symbols-outlined text-secondary text-lg group-hover:rotate-45 transition-transform duration-300">palette</span>
        <div class="text-left hidden sm:block">
          <span class="text-[9px] uppercase tracking-widest text-border-brass font-bold block leading-none">
            {{ currentAgentId === 'amy' ? 'Amy Detwiler' : 'Kyle Baugh' }}
          </span>
          <span class="text-xs font-semibold leading-tight">
            Editorial Monograph
          </span>
        </div>
        <span class="w-2.5 h-2.5 rounded-full ring-1 ring-canvas-white/40" :style="{ backgroundColor: templates.find(t => t.id === currentTemplate)?.previewColor }"></span>
      </button>
    </div>

    <!-- Expanded Switcher Modal -->
    <div
      v-else
      class="bg-canvas-white/95 backdrop-blur-2xl border border-border-brass/80 shadow-2xl rounded-2xl p-4 sm:p-5 w-[330px] sm:w-[370px] text-primary transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-secondary text-xl">palette</span>
          <div>
            <h4 class="font-headline text-base font-semibold text-primary leading-tight">Luxury Client Showcase</h4>
            <span class="text-[10px] text-charcoal-muted uppercase tracking-wider font-semibold block">Multi-Client Isolated Switcher</span>
          </div>
        </div>
        <button
          @click="isOpen = false"
          class="p-1 text-charcoal-muted hover:text-primary rounded-md hover:bg-surface-linen transition-colors"
          aria-label="Close design switcher"
        >
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      <!-- 0. CLIENT / AGENT SELECTION -->
      <div class="mb-3 pb-3 border-b border-border-subtle">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] uppercase tracking-wider text-charcoal-muted font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-xs text-secondary">badge</span>
            Client Portfolio:
          </span>
          <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">
            {{ currentAgentId === 'amy' ? 'Amy Detwiler' : 'Kyle Baugh (Default)' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-1.5 p-1 bg-surface-linen/80 rounded-xl border border-border-subtle">
          <button
            type="button"
            @click="handleSwitchAgent('kyle')"
            :class="[
              'py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1',
              currentAgentId === 'kyle'
                ? 'bg-canvas-white text-primary shadow-sm border border-border-brass font-bold ring-1 ring-secondary/30'
                : 'text-charcoal-muted hover:text-primary hover:bg-canvas-white/50'
            ]"
          >
            <span>🏛️ Kyle Baugh</span>
          </button>
          <button
            type="button"
            @click="handleSwitchAgent('amy')"
            :class="[
              'py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1',
              currentAgentId === 'amy'
                ? 'bg-canvas-white text-primary shadow-sm border border-border-brass font-bold ring-1 ring-secondary/30'
                : 'text-charcoal-muted hover:text-primary hover:bg-canvas-white/50'
            ]"
          >
            <span>👑 Amy Detwiler</span>
          </button>
        </div>
      </div>

      <!-- 2. LUXURY COLOR PALETTE OPTIONS -->
      <div class="mb-3">
        <span class="text-[10px] uppercase tracking-wider text-charcoal-muted font-bold block mb-1.5 flex items-center gap-1">
          <span class="material-symbols-outlined text-xs text-secondary">format_paint</span>
          Color Palette:
        </span>
        <div class="space-y-1 max-h-44 overflow-y-auto pr-0.5">
          <div
            v-for="t in templates"
            :key="t.id"
            @click="handleSelectTheme(t.id)"
            :class="[
              'p-2 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between group',
              currentTemplate === t.id
                ? 'border-secondary bg-surface-linen/70 ring-1 ring-secondary/50 shadow-sm'
                : 'border-border-subtle hover:border-border-brass bg-surface-alabaster/40'
            ]"
          >
            <div class="flex items-center gap-2">
              <span
                class="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-sm"
                :style="{ backgroundColor: t.previewColor }"
              ></span>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-semibold text-primary block leading-tight">{{ t.name }}</span>
                  <span v-if="currentTemplate === t.id" class="text-[8px] px-1.5 py-0.2 bg-secondary text-canvas-white rounded font-bold uppercase tracking-wider">Active</span>
                </div>
                <span class="text-[10px] text-charcoal-muted line-clamp-1 mt-0.5">{{ t.tagline }}</span>
              </div>
            </div>

            <button
              @click.stop="handleCopyLink(t.id)"
              class="p-1 text-charcoal-muted hover:text-secondary rounded hover:bg-canvas-white/80 transition-colors"
              :title="'Copy direct URL for ' + t.name"
              aria-label="Copy template link"
            >
              <span class="material-symbols-outlined text-base">link</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer & Isolated Shareable Link -->
      <div class="pt-2.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-charcoal-muted">
        <span class="text-[10px] font-mono">
          {{ currentAgentId === 'kyle' ? 'Default: Kyle Baugh' : '?agent=amy' }}
        </span>
        <button
          @click="handleCopyLink(currentTemplate)"
          class="text-secondary hover:underline font-bold flex items-center gap-1"
        >
          <span>Copy Dedicated Link</span>
          <span class="material-symbols-outlined text-xs">share</span>
        </button>
      </div>
    </div>
  </div>
</template>
