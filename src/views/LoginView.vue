<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const passcode = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const validPasscodes = ["admin123", "Ayub@123", "webpenter2026"];

function handleLogin() {
  errorMessage.value = "";
  const entered = passcode.value.trim();

  if (!entered) {
    errorMessage.value = "Please enter your master passcode.";
    return;
  }

  isLoading.value = true;
  setTimeout(() => {
    if (validPasscodes.includes(entered)) {
      sessionStorage.setItem("webpenter_master_auth", "true");
      sessionStorage.setItem("admin_auth_v1", "true");
      router.push("/portal");
    } else {
      errorMessage.value = "Invalid passcode. Access denied.";
      passcode.value = "";
      isLoading.value = false;
    }
  }, 400);
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 selection:bg-amber-500 selection:text-slate-950">
    <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      <!-- Decorative Glow -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 mx-auto flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-amber-500/20">
          W
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-white tracking-tight">Master Control Suite</h1>
        <p class="text-xs text-slate-400">
          Private administrative console for Webpenter Real Estate Advisory.
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Master Passcode
          </label>
          <input
            v-model="passcode"
            type="password"
            autofocus
            placeholder="Enter master passcode"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div v-if="errorMessage" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <span v-if="isLoading" class="animate-spin text-sm">⏳</span>
          <span>{{ isLoading ? "Verifying..." : "Unlock Command Suite" }}</span>
        </button>
      </form>

      <div class="pt-2 text-center">
        <router-link to="/" class="text-xs text-slate-500 hover:text-amber-400 transition font-mono">
          &larr; Return to Public Portfolio
        </router-link>
      </div>
    </div>
  </div>
</template>
