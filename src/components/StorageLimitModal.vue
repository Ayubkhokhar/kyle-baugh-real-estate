<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStorageQuota } from "../composables/useStorageQuota";

const router = useRouter();
const {
  storageThresholdGB,
  showLimitModal,
  quotaEventDetails,
  setThreshold,
  setUpgraded,
  closeLimitModal,
} = useStorageQuota();

const customLimit = ref(storageThresholdGB.value);

function handleUpgrade() {
  setUpgraded(true, 50.0);
}

function handleManageStorage() {
  closeLimitModal();
  router.push("/manage");
}

function applyCustomThreshold() {
  if (customLimit.value > 0) {
    setThreshold(customLimit.value);
    closeLimitModal();
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="showLimitModal"
      class="fixed inset-0 z-50 overflow-y-auto bg-primary/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div
        class="bg-canvas-white border border-border-brass max-w-2xl w-full rounded-lg shadow-2xl p-6 sm:p-8 relative"
      >
        <!-- Close button -->
        <button
          @click="closeLimitModal"
          class="absolute top-5 right-5 text-charcoal-muted hover:text-primary transition-colors p-1"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>

        <!-- Badge & Title -->
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2.5 py-0.5 bg-red-100 text-red-800 text-[11px] font-bold tracking-wider uppercase rounded-sm border border-red-200">
            Storage Threshold Warning
          </span>
          <span class="text-xs uppercase tracking-widest text-charcoal-muted font-semibold">
            Cloudflare R2 Quota Guard
          </span>
        </div>

        <h2 class="font-headline text-2xl sm:text-3xl text-primary mb-3">
          8 GB Cloudflare Limit Detected
        </h2>

        <p class="text-charcoal-body text-sm leading-relaxed mb-6">
          To ensure you remain within Cloudflare's free tier and avoid unexpected billing, further uploads are paused because this upload approaches or exceeds your <strong class="text-primary">{{ storageThresholdGB }} GB</strong> threshold.
        </p>

        <!-- Usage Stat Box -->
        <div class="bg-surface-linen p-4 rounded-md border border-border-subtle mb-6 grid grid-cols-3 gap-3 text-center">
          <div>
            <span class="block text-[11px] uppercase tracking-wider text-charcoal-muted font-semibold">Current Stored</span>
            <span class="font-headline text-lg text-primary">{{ quotaEventDetails?.currentGB || '0.00' }} GB</span>
          </div>
          <div>
            <span class="block text-[11px] uppercase tracking-wider text-charcoal-muted font-semibold">Attempted Upload</span>
            <span class="font-headline text-lg text-secondary">+{{ quotaEventDetails?.incomingGB || '0.00' }} GB</span>
          </div>
          <div>
            <span class="block text-[11px] uppercase tracking-wider text-charcoal-muted font-semibold">Free Threshold</span>
            <span class="font-headline text-lg text-primary">{{ storageThresholdGB }} GB</span>
          </div>
        </div>

        <!-- Decision Options -->
        <div class="space-y-4 mb-6">
          <h3 class="text-xs uppercase tracking-widest text-charcoal-muted font-semibold">
            Select Your Next Step
          </h3>

          <!-- Option 1: Manage Free Tier -->
          <div
            @click="handleManageStorage"
            class="p-4 border border-border-subtle hover:border-secondary rounded-md bg-surface-alabaster cursor-pointer transition-all hover:shadow-sm flex items-start gap-4 group"
          >
            <div class="w-10 h-10 rounded-full bg-surface-linen border border-border-brass flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-secondary text-xl">delete_sweep</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-semibold text-primary text-base">Stay on Free Tier (Clean Up Old Media)</h4>
                <span class="text-xs text-secondary font-semibold uppercase tracking-wider">Free</span>
              </div>
              <p class="text-xs text-charcoal-muted mt-1 leading-relaxed">
                Open the property management dashboard to review and remove older photos or closed listings to reclaim storage space.
              </p>
            </div>
          </div>

          <!-- Option 2: Buy Cloudflare Data -->
          <div
            @click="handleUpgrade"
            class="p-4 border-2 border-primary hover:border-secondary rounded-md bg-surface-alabaster cursor-pointer transition-all hover:shadow-sm flex items-start gap-4 group"
          >
            <div class="w-10 h-10 rounded-full bg-primary text-canvas-white flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
              <span class="material-symbols-outlined text-secondary text-xl">cloud_done</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-semibold text-primary text-base">Buy Cloudflare Data / Upgrade Plan</h4>
                <span class="text-xs bg-primary text-canvas-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold">
                  Recommended
                </span>
              </div>
              <p class="text-xs text-charcoal-muted mt-1 leading-relaxed">
                Cloudflare R2 paid storage is $0.015/GB/month with zero egress fees. Unlock 50 GB storage threshold instantly.
              </p>
            </div>
          </div>

          <!-- Option 3: Manual Threshold Adjustment -->
          <div class="p-4 border border-border-subtle rounded-md bg-surface-linen flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span class="font-semibold text-primary text-xs uppercase tracking-wider block">Custom Limit Override</span>
              <span class="text-[11px] text-charcoal-muted">Manually adjust quota threshold for your account</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="customLimit"
                type="number"
                min="1"
                max="500"
                class="w-20 px-2 py-1.5 text-sm bg-canvas-white border border-border-subtle rounded text-center focus:outline-none focus:border-secondary"
              />
              <span class="text-xs font-semibold text-charcoal-muted">GB</span>
              <button
                @click="applyCustomThreshold"
                class="px-3 py-1.5 bg-primary text-canvas-white text-xs font-semibold uppercase tracking-wider hover:bg-secondary transition-colors rounded"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-border-subtle">
          <button
            @click="closeLimitModal"
            class="px-5 py-2.5 border border-border-subtle text-charcoal-body hover:bg-surface-linen text-xs uppercase tracking-wider font-semibold transition-colors rounded"
          >
            Cancel Upload
          </button>
          <button
            @click="handleUpgrade"
            class="px-6 py-2.5 bg-primary text-canvas-white hover:bg-secondary text-xs uppercase tracking-wider font-semibold transition-colors rounded shadow-sm"
          >
            Upgrade & Continue
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
