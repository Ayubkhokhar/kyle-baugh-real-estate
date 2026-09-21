<script setup>
import { ref } from "vue";
import { useDesignLayout } from "../composables/useDesignLayout";

const emit = defineEmits(["toast"]);

const { designOptions, currentDesign, setDesign, getShareUrl } = useDesignLayout();
const isOpen = ref(false);

function togglePanel() {
  isOpen.value = !isOpen.value;
}

function handleSelectDesign(id) {
  setDesign(id);
  const active = designOptions.find((d) => d.id === id);
  emit("toast", `Layout switched to "${active?.name}"`, "success");
}

async function handleCopyLink(id) {
  const url = getShareUrl(id);
  try {
    await navigator.clipboard.writeText(url);
    const active = designOptions.find((d) => d.id === id);
    emit("toast", `Copied shareable link for ${active?.name}!`, "success");
  } catch (err) {
    emit("toast", "Unable to copy link: " + url, "error");
  }
}
</script>

<template>
  <div class="fixed bottom-6 left-6 z-50">
    <!-- Main Floating Toggle Button -->
    <div class="relative">
      <button
        @click="togglePanel"
        aria-label="Toggle Design Layouts"
        class="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 text-white shadow-2xl border border-white/20 backdrop-blur-md hover:bg-slate-800 transition-all duration-200 group focus:outline-none"
      >
        <span class="material-symbols-outlined text-amber-300 text-lg group-hover:rotate-180 transition-transform duration-500">
          dashboard_customize
        </span>
        <div class="text-left hidden sm:block">
          <p class="text-[9px] uppercase tracking-widest text-slate-400 font-bold leading-none">Design Mode</p>
          <p class="text-xs font-semibold text-white leading-tight">
            {{ currentDesign === 'cinematic' ? 'Design 2: Cinematic Luxe' : 'Design 1: Architectural Dossier' }}
          </p>
        </div>
        <span class="material-symbols-outlined text-sm text-slate-400">
          {{ isOpen ? 'expand_more' : 'unfold_more' }}
        </span>
      </button>

      <!-- Dropdown / Popover Modal -->
      <div
        v-if="isOpen"
        class="absolute bottom-14 left-0 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-white/20 shadow-2xl backdrop-blur-2xl p-4 text-white animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-300 text-lg">architecture</span>
            <span class="text-xs uppercase tracking-wider font-bold text-white">Compare Design Options</span>
          </div>
          <button
            @click="isOpen = false"
            class="text-slate-400 hover:text-white transition-colors"
            aria-label="Close Design Selector"
          >
            <span class="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <p class="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Switch between 2 fundamentally different modern architectural designs to test which layout drives higher client impressions:
        </p>

        <!-- Design Option Cards -->
        <div class="space-y-2.5">
          <div
            v-for="design in designOptions"
            :key="design.id"
            @click="handleSelectDesign(design.id)"
            :class="[
              'p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left relative',
              currentDesign === design.id
                ? 'bg-amber-400/10 border-amber-300/80 shadow-md ring-1 ring-amber-300/50'
                : 'bg-white/[0.04] border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
            ]"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-amber-300">{{ design.icon }}</span>
                <span class="text-xs font-bold text-white">{{ design.name }}</span>
              </div>
              <span
                :class="[
                  'text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                  currentDesign === design.id ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-slate-300'
                ]"
              >
                {{ design.badge }}
              </span>
            </div>

            <p class="text-[11px] text-slate-300 font-light line-clamp-2 leading-relaxed mb-2">
              {{ design.description }}
            </p>

            <div class="flex items-center justify-between pt-1 text-[10px]">
              <span class="text-amber-300/90 font-medium">{{ design.tagline }}</span>
              <button
                @click.stop="handleCopyLink(design.id)"
                class="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 font-medium inline-flex items-center gap-1 transition-colors"
                title="Copy shareable link for this design"
              >
                <span class="material-symbols-outlined text-xs">link</span>
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-white/10 text-center">
          <p class="text-[10px] text-slate-400">
            Pass <code class="px-1 py-0.5 bg-black/40 rounded text-amber-200">?design=cinematic</code> in any URL to load Design 2 directly.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
