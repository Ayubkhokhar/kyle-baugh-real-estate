<script setup>
import { ref, computed } from "vue";
import { useProperties } from "../composables/useProperties";
import { useInquiries } from "../composables/useInquiries";
import { useSiteSettings } from "../composables/useSiteSettings";
import { useStorageQuota } from "../composables/useStorageQuota";
import { useThemeTemplate } from "../composables/useThemeTemplate";
import { useAgentResolver } from "../composables/useAgentResolver";
import StorageLimitModal from "../components/StorageLimitModal.vue";

const emit = defineEmits(["toast"]);

const {
  properties,
  compassMeta,
  syncWithCompass,
  updateProperty,
  deleteProperty,
  toggleStatus,
  resetToDefaults,
  exportJSON,
  importJSON
} = useProperties();

const { inquiries, unreadCount, updateStatus, deleteInquiry, exportCSV } = useInquiries();
const { siteSettings, saveSettings, resetSettings, verifyPasscode } = useSiteSettings();
const { storageThresholdGB, isUpgraded, calculateTotalBytes, formatBytes, setThreshold, setUpgraded } = useStorageQuota();
const { templates, currentTemplate, setTemplate, getShareUrl } = useThemeTemplate();
const { availableAgents, currentAgentId, setAgent } = useAgentResolver();

function handleTemplateSelect(id) {
  setTemplate(id);
  emit("toast", `Luxury template set to "${templates.find(t => t.id === id)?.name}"`, "success");
}

// Authentication Gate
const isAuthenticated = ref(
  sessionStorage.getItem("admin_auth_v1") === "true" ||
  sessionStorage.getItem("kyle_admin_auth") === "true"
);
const passcodeInput = ref("");
const authError = ref(false);

function handleLogin() {
  if (verifyPasscode(passcodeInput.value)) {
    isAuthenticated.value = true;
    sessionStorage.setItem("admin_auth_v1", "true");
    authError.value = false;
    emit("toast", "Welcome back, " + siteSettings.value.advisorName, "success");
  } else {
    authError.value = true;
  }
}

function handleLogout() {
  isAuthenticated.value = false;
  sessionStorage.removeItem("admin_auth_v1");
  sessionStorage.removeItem("kyle_admin_auth");
  passcodeInput.value = "";
}

// Active Tab
const activeTab = ref("properties"); // 'properties', 'compass', 'leads', 'storage', 'settings'

// Properties Tab State
const propSearch = ref("");
const statusFilter = ref("all");
const selectedPropertyForEdit = ref(null);
const isEditModalOpen = ref(false);
const isSyncingCompass = ref(false);

const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    if (statusFilter.value !== "all" && p.status !== statusFilter.value) {
      return false;
    }
    if (propSearch.value.trim()) {
      const q = propSearch.value.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q) || p.neighborhood?.toLowerCase().includes(q);
    }
    return true;
  });
});

const totalPortfolioVolume = computed(() => {
  return properties.value.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
});

async function handleSyncCompass() {
  isSyncingCompass.value = true;
  try {
    const res = await syncWithCompass();
    emit("toast", `Compass synchronization complete! Merged ${res.newCount} updates. Total: ${res.total} listings.`, "success");
  } catch (err) {
    emit("toast", "Compass sync error: " + err.message, "error");
  } finally {
    isSyncingCompass.value = false;
  }
}

function openEditModal(prop) {
  selectedPropertyForEdit.value = JSON.parse(JSON.stringify(prop));
  isEditModalOpen.value = true;
}

function savePropertyEdit() {
  if (selectedPropertyForEdit.value) {
    updateProperty(selectedPropertyForEdit.value.id, selectedPropertyForEdit.value);
    isEditModalOpen.value = false;
    emit("toast", "Property updated successfully.", "success");
  }
}

function confirmDeleteProperty(id, title) {
  if (confirm(`Are you sure you want to delete "${title}" from your portfolio?`)) {
    deleteProperty(id);
    emit("toast", "Property removed.", "info");
  }
}

// Backup file upload
function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  importJSON(file)
    .then((count) => {
      emit("toast", `Successfully imported ${count} properties.`, "success");
    })
    .catch((err) => {
      emit("toast", "Import failed: " + err.message, "error");
    });
  event.target.value = "";
}

// Storage Computations
const currentBytes = computed(() => calculateTotalBytes(properties.value));
const currentGB = computed(() => (currentBytes.value / (1024 * 1024 * 1024)).toFixed(2));
const storagePercentage = computed(() => {
  const limit = storageThresholdGB.value * 1024 * 1024 * 1024;
  return Math.min(100, Math.round((currentBytes.value / limit) * 100));
});

// Settings Form
const settingsForm = ref({ ...siteSettings.value });

function handleSaveSettings() {
  saveSettings(settingsForm.value);
  emit("toast", "Site customizations saved.", "success");
}

function handleResetSettings() {
  if (confirm("Reset site customizations to original defaults?")) {
    resetSettings();
    settingsForm.value = { ...siteSettings.value };
    emit("toast", "Settings reset to defaults.", "info");
  }
}
</script>

<template>
  <div class="bg-surface-alabaster min-h-screen py-8 px-5 lg:px-12">
    <!-- 1. Passcode Gate -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto py-16">
      <div class="bg-canvas-white border border-border-brass p-8 rounded-lg shadow-xl text-center">
        <div class="w-14 h-14 rounded-full bg-surface-linen border border-border-brass mx-auto mb-4 flex items-center justify-center">
          <span class="material-symbols-outlined text-secondary text-2xl">lock</span>
        </div>
        <h2 class="font-headline text-2xl text-primary mb-1">Advisory Console</h2>
        <p class="text-xs text-charcoal-muted uppercase tracking-widest font-semibold mb-6">Restricted Access</p>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <input
              v-model="passcodeInput"
              type="password"
              placeholder="Enter Admin Passcode (Default: admin123)"
              class="w-full px-4 py-3 bg-surface-alabaster border border-border-subtle rounded text-center text-sm focus:outline-none focus:border-secondary"
            />
            <p v-if="authError" class="text-xs text-red-600 mt-1 font-semibold">Invalid Passcode. Please try again.</p>
          </div>
          <button
            type="submit"
            class="w-full py-3 bg-primary text-canvas-white text-xs uppercase tracking-widest font-semibold rounded hover:bg-secondary transition-colors"
          >
            Unlock Console
          </button>
        </form>
      </div>
    </div>

    <!-- 2. Authenticated Dashboard -->
    <div v-else class="max-w-7xl mx-auto space-y-6">
      <!-- Top Management Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-status-active"></span>
            <span class="text-xs uppercase tracking-widest text-charcoal-muted font-semibold">Real Estate Management Console</span>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <h1 class="font-headline text-2xl sm:text-3xl text-primary">{{ siteSettings.advisorName }} Advisory Dashboard</h1>
            <!-- Client Switcher in Dashboard -->
            <div class="inline-flex rounded-lg border border-border-subtle p-0.5 bg-surface-linen text-xs">
              <button
                v-for="a in availableAgents"
                :key="a.id"
                type="button"
                @click="setAgent(a.id)"
                :class="[
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors',
                  currentAgentId === a.id ? 'bg-canvas-white text-primary shadow-xs font-bold border border-border-brass/50' : 'text-charcoal-muted hover:text-primary'
                ]"
              >
                {{ a.name }}
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <router-link
            :to="currentAgentId === 'kyle' ? '/kyle' : `/${currentAgentId}`"
            class="px-3 py-2 bg-canvas-white border border-border-brass text-xs uppercase tracking-wider font-semibold rounded hover:bg-surface-linen flex items-center gap-1.5 transition-colors text-primary"
          >
            <span class="material-symbols-outlined text-base">visibility</span>
            <span>View Public Site</span>
          </router-link>
          <button
            @click="exportJSON"
            class="px-3 py-2 bg-canvas-white border border-border-subtle text-xs uppercase tracking-wider font-semibold rounded hover:bg-surface-linen flex items-center gap-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-base">download</span>
            <span>Export JSON</span>
          </button>
          <label class="px-3 py-2 bg-canvas-white border border-border-subtle text-xs uppercase tracking-wider font-semibold rounded hover:bg-surface-linen flex items-center gap-1.5 cursor-pointer transition-colors">
            <span class="material-symbols-outlined text-base">upload</span>
            <span>Import JSON</span>
            <input type="file" accept=".json" @change="handleImportFile" class="hidden" />
          </label>
          <router-link
            :to="currentAgentId === 'amy' ? '/submit?agent=amy' : '/submit'"
            class="px-4 py-2 bg-primary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-secondary flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span class="material-symbols-outlined text-base">add</span>
            <span>Add Property</span>
          </router-link>
          <button
            @click="handleLogout"
            class="p-2 text-charcoal-muted hover:text-primary transition-colors"
            title="Lock Console"
          >
            <span class="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap border-b border-border-subtle gap-2">
        <button
          @click="activeTab = 'properties'"
          :class="[
            'px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all border-b-2 flex items-center gap-2',
            activeTab === 'properties' ? 'border-primary text-primary' : 'border-transparent text-charcoal-muted hover:text-primary'
          ]"
        >
          <span class="material-symbols-outlined text-base">home</span>
          <span>Properties ({{ properties.length }})</span>
        </button>
        <button
          @click="activeTab = 'compass'"
          :class="[
            'px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all border-b-2 flex items-center gap-2',
            activeTab === 'compass' ? 'border-primary text-primary bg-surface-linen/50' : 'border-transparent text-charcoal-muted hover:text-primary'
          ]"
        >
          <span class="material-symbols-outlined text-base text-secondary">explore</span>
          <span>Compass Auto-Sync ({{ properties.filter(p => p.isCompassListing).length }})</span>
        </button>
        <button
          @click="activeTab = 'leads'"
          :class="[
            'px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all border-b-2 flex items-center gap-2',
            activeTab === 'leads' ? 'border-primary text-primary' : 'border-transparent text-charcoal-muted hover:text-primary'
          ]"
        >
          <span class="material-symbols-outlined text-base">inbox</span>
          <span>Inquiries & Leads</span>
          <span v-if="unreadCount > 0" class="px-2 py-0.2 bg-secondary text-canvas-white text-[10px] rounded-full font-bold">
            {{ unreadCount }}
          </span>
        </button>
        <button
          @click="activeTab = 'storage'"
          :class="[
            'px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all border-b-2 flex items-center gap-2',
            activeTab === 'storage' ? 'border-primary text-primary' : 'border-transparent text-charcoal-muted hover:text-primary'
          ]"
        >
          <span class="material-symbols-outlined text-base">cloud_queue</span>
          <span>Cloudflare 8 GB Guard</span>
          <span class="text-[10px] text-secondary font-bold">{{ storagePercentage }}%</span>
        </button>
        <button
          @click="activeTab = 'settings'"
          :class="[
            'px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all border-b-2 flex items-center gap-2',
            activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-charcoal-muted hover:text-primary'
          ]"
        >
          <span class="material-symbols-outlined text-base">tune</span>
          <span>Site Customizer</span>
        </button>
      </div>

      <!-- TAB 1: PROPERTIES MANAGEMENT -->
      <div v-if="activeTab === 'properties'" class="space-y-6">
        <!-- Compass Live Sync Quick Banner -->
        <div class="bg-gradient-to-r from-primary via-charcoal-body to-primary text-canvas-white p-5 rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border-brass/30">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/50 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-secondary text-xl">explore</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-headline text-base tracking-wide font-medium">Compass Auto-Scraper Active</span>
                <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] uppercase tracking-wider font-semibold rounded border border-emerald-500/30">Auto Cron</span>
              </div>
              <p class="text-xs text-canvas-white/80 mt-0.5">
                Automatically scrapes from <a :href="compassMeta.agentUrl || siteSettings.profileUrl" target="_blank" class="text-secondary hover:underline font-medium">{{ (compassMeta.agentUrl || siteSettings.profileUrl || '').replace('https://www.', '').replace('https://', '') }}</a> · High-res photos hosted on Cloudflare
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div class="text-right hidden sm:block">
              <span class="text-[10px] uppercase tracking-wider text-canvas-white/60 block font-semibold">Last Synchronized</span>
              <span class="text-xs text-canvas-white/90 font-mono">{{ new Date(compassMeta.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
            </div>
            <button
              @click="handleSyncCompass"
              :disabled="isSyncingCompass"
              class="px-4 py-2.5 bg-secondary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-secondary/90 transition-all flex items-center gap-2 disabled:opacity-60 shadow-sm"
            >
              <span :class="['material-symbols-outlined text-base', isSyncingCompass ? 'animate-spin' : '']">sync</span>
              <span>{{ isSyncingCompass ? 'Syncing...' : 'Sync Compass Now' }}</span>
            </button>
          </div>
        </div>

        <!-- Overview Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-canvas-white p-4 border border-border-subtle rounded shadow-sm">
            <span class="text-[11px] uppercase tracking-wider text-charcoal-muted font-semibold block">Total Volume</span>
            <span class="font-headline text-2xl text-primary font-medium">${{ (totalPortfolioVolume / 1000000).toFixed(1) }}M</span>
          </div>
          <div class="bg-canvas-white p-4 border border-border-subtle rounded shadow-sm">
            <span class="text-[11px] uppercase tracking-wider text-charcoal-muted font-semibold block">Total Listings</span>
            <span class="font-headline text-2xl text-primary font-medium">{{ properties.length }}</span>
          </div>
          <div class="bg-canvas-white p-4 border border-border-subtle rounded shadow-sm">
            <span class="text-[11px] uppercase tracking-wider text-charcoal-muted font-semibold block">Active Exclusives</span>
            <span class="font-headline text-2xl text-status-active font-medium">{{ properties.filter(p => p.status === 'Active Exclusive').length }}</span>
          </div>
          <div class="bg-canvas-white p-4 border border-border-subtle rounded shadow-sm">
            <span class="text-[11px] uppercase tracking-wider text-charcoal-muted font-semibold block">Sold & Leased</span>
            <span class="font-headline text-2xl text-secondary font-medium">{{ properties.filter(p => p.status === 'Sold Portfolio' || p.status === 'Leased').length }}</span>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-canvas-white p-4 border border-border-subtle rounded flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <span class="text-xs uppercase tracking-wider text-charcoal-muted font-semibold">Filter:</span>
            <select
              v-model="statusFilter"
              class="px-3 py-1.5 text-xs bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
            >
              <option value="all">All Statuses</option>
              <option value="Active Exclusive">Active Exclusive</option>
              <option value="Private Exclusive">Private Exclusive</option>
              <option value="Sold Portfolio">Sold Portfolio</option>
              <option value="Leased">Leased</option>
            </select>
          </div>
          <div class="w-full sm:w-72">
            <input
              v-model="propSearch"
              type="text"
              placeholder="Search properties..."
              class="w-full px-3 py-1.5 text-xs bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
            />
          </div>
        </div>

        <!-- Properties Table -->
        <div class="bg-canvas-white border border-border-subtle rounded shadow-sm overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-linen border-b border-border-subtle uppercase tracking-wider font-semibold text-charcoal-muted">
              <tr>
                <th class="p-4">Property</th>
                <th class="p-4">Origin</th>
                <th class="p-4">Price</th>
                <th class="p-4">Specs</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="p in filteredProperties" :key="p.id" class="hover:bg-surface-alabaster/60 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <img :src="p.heroImage" class="w-12 h-10 object-cover rounded bg-surface-linen shrink-0 border border-border-subtle" />
                    <div>
                      <span class="font-semibold text-primary block truncate max-w-xs">{{ p.title }}</span>
                      <span class="text-charcoal-muted text-[11px] block truncate max-w-xs">{{ p.address }}</span>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span v-if="p.isCompassListing" class="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-linen text-primary border border-border-brass/60 rounded text-[10px] font-semibold uppercase tracking-wider">
                    <span class="material-symbols-outlined text-[12px] text-secondary">verified</span>
                    Compass
                  </span>
                  <span v-else class="px-2 py-0.5 bg-surface-alabaster text-charcoal-muted border border-border-subtle rounded text-[10px] font-semibold uppercase tracking-wider">
                    Custom
                  </span>
                </td>
                <td class="p-4 font-headline text-sm font-semibold text-primary">{{ p.priceFormatted }}</td>
                <td class="p-4 text-charcoal-muted">{{ p.bedrooms }}b / {{ p.bathrooms }}ba · {{ p.sqft?.toLocaleString() }} sqft</td>
                <td class="p-4">
                  <select
                    :value="p.status"
                    @change="toggleStatus(p.id, $event.target.value)"
                    class="px-2 py-1 text-[11px] bg-surface-alabaster border border-border-subtle rounded font-semibold text-primary focus:outline-none focus:border-secondary"
                  >
                    <option value="Active Exclusive">Active Exclusive</option>
                    <option value="Private Exclusive">Private Exclusive</option>
                    <option value="Sold Portfolio">Sold Portfolio</option>
                    <option value="Leased">Leased</option>
                  </select>
                </td>
                <td class="p-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <router-link :to="'/property/' + p.id" target="_blank" class="p-1.5 text-charcoal-muted hover:text-primary rounded hover:bg-surface-linen" title="View Public Listing">
                      <span class="material-symbols-outlined text-base">visibility</span>
                    </router-link>
                    <button @click="openEditModal(p)" class="p-1.5 text-charcoal-muted hover:text-secondary rounded hover:bg-surface-linen" title="Edit Listing">
                      <span class="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button @click="confirmDeleteProperty(p.id, p.title)" class="p-1.5 text-charcoal-muted hover:text-red-600 rounded hover:bg-surface-linen" title="Delete Listing">
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center text-xs text-charcoal-muted pt-2">
          <span>Showing {{ filteredProperties.length }} of {{ properties.length }} properties</span>
          <button @click="resetToDefaults" class="text-xs text-charcoal-muted hover:text-red-600 underline">
            Reset to Sample & Compass Data
          </button>
        </div>
      </div>

      <!-- TAB 2: COMPASS AUTO-SYNC CENTER -->
      <div v-if="activeTab === 'compass'" class="space-y-6">
        <!-- Live Status Details -->
        <div class="bg-canvas-white border border-border-subtle p-6 rounded-lg shadow-sm space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-xs uppercase tracking-widest text-secondary font-bold">Automated Pipeline Active</span>
              </div>
              <h2 class="font-headline text-2xl text-primary">{{ siteSettings.advisorName }} Compass Synchronization</h2>
              <p class="text-xs text-charcoal-muted mt-1">
                Direct scraping pipeline connected to
                <a :href="compassMeta.agentUrl || siteSettings.profileUrl" target="_blank" class="text-primary underline font-medium hover:text-secondary">
                  {{ (compassMeta.agentUrl || siteSettings.profileUrl || '').replace('https://www.', '').replace('https://', '') }}
                </a>
              </p>
            </div>
            <button
              @click="handleSyncCompass"
              :disabled="isSyncingCompass"
              class="px-5 py-3 bg-secondary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-primary transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
            >
              <span :class="['material-symbols-outlined text-base', isSyncingCompass ? 'animate-spin' : '']">sync</span>
              <span>{{ isSyncingCompass ? 'Fetching Live...' : 'Sync from Compass Now' }}</span>
            </button>
          </div>

          <!-- 4 Metric Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <span class="text-[10px] uppercase tracking-wider text-charcoal-muted font-bold block mb-1">Active Listing</span>
              <span class="font-headline text-2xl text-status-active font-medium">{{ compassMeta.activeCount }}</span>
              <span class="text-[11px] text-charcoal-muted block mt-0.5">Active Exclusives</span>
            </div>
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <span class="text-[10px] uppercase tracking-wider text-charcoal-muted font-bold block mb-1">Past Sales Closed</span>
              <span class="font-headline text-2xl text-primary font-medium">{{ compassMeta.soldCount }}</span>
              <span class="text-[11px] text-charcoal-muted block mt-0.5">Closed Track Record</span>
            </div>
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <span class="text-[10px] uppercase tracking-wider text-charcoal-muted font-bold block mb-1">Leased Properties</span>
              <span class="font-headline text-2xl text-secondary font-medium">{{ compassMeta.leasedCount }}</span>
              <span class="text-[11px] text-charcoal-muted block mt-0.5">High-end executive leases</span>
            </div>
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <span class="text-[10px] uppercase tracking-wider text-charcoal-muted font-bold block mb-1">Total Properties</span>
              <span class="font-headline text-2xl text-primary font-medium">{{ properties.length }}</span>
              <span class="text-[11px] text-charcoal-muted block mt-0.5">Hosted on Cloudflare Edge</span>
            </div>
          </div>

          <!-- Architecture & Cron Flow Explainer -->
          <div class="bg-surface-linen/60 border border-border-brass/40 p-5 rounded-lg space-y-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-secondary">schedule</span>
              <h3 class="font-headline text-base text-primary font-semibold">How the Automated Cron & Cloudflare Pipeline Operates</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-charcoal-body leading-relaxed">
              <div class="bg-canvas-white p-3.5 rounded border border-border-subtle">
                <span class="font-bold text-primary block mb-1">1. Scheduled Daily Scraper</span>
                Runs automatically every 24 hours at 04:00 UTC via GitHub Actions cron. Fetches {{ siteSettings.advisorName }}'s Compass page and detects new listings or price adjustments.
              </div>
              <div class="bg-canvas-white p-3.5 rounded border border-border-subtle">
                <span class="font-bold text-primary block mb-1">2. Cloudflare Media Hosting</span>
                Compass blocks external hotlinking. The scraper downloads high-resolution WebP photos directly into Cloudflare's Edge CDN storage, bypassing all hotlink blocks.
              </div>
              <div class="bg-canvas-white p-3.5 rounded border border-border-subtle">
                <span class="font-bold text-primary block mb-1">3. Instant Auto-Deploy</span>
                When a new listing is found, changes are committed and Cloudflare automatically deploys the updated portfolio in under 60 seconds with zero client work.
              </div>
            </div>
          </div>

          <!-- Scraped Compass Listings Quick Table -->
          <div>
            <h3 class="font-headline text-lg text-primary mb-3">Compass Verified Property Dossiers</h3>
            <div class="border border-border-subtle rounded overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-surface-linen text-charcoal-muted uppercase font-semibold border-b border-border-subtle">
                  <tr>
                    <th class="p-3">Residence</th>
                    <th class="p-3">Price</th>
                    <th class="p-3">Category</th>
                    <th class="p-3">Cloudflare Photos</th>
                    <th class="p-3 text-right">Links</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle">
                  <tr v-for="c in properties.filter(p => p.isCompassListing).slice(0, 10)" :key="c.id" class="hover:bg-surface-alabaster">
                    <td class="p-3 flex items-center gap-2.5">
                      <img :src="c.heroImage" class="w-10 h-8 object-cover rounded bg-surface-linen border border-border-subtle" />
                      <div>
                        <span class="font-semibold text-primary block">{{ c.title }}</span>
                        <span class="text-[11px] text-charcoal-muted">{{ c.neighborhood }}</span>
                      </div>
                    </td>
                    <td class="p-3 font-semibold text-primary">{{ c.priceFormatted }}</td>
                    <td class="p-3">
                      <span :class="[
                        'px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                        c.status === 'Active Exclusive' ? 'bg-emerald-50 text-status-active border border-emerald-200' : 'bg-surface-linen text-charcoal-muted'
                      ]">
                        {{ c.status }}
                      </span>
                    </td>
                    <td class="p-3 text-charcoal-muted">{{ c.gallery?.length || 1 }} Cached Images</td>
                    <td class="p-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <router-link :to="'/property/' + c.id" class="text-secondary hover:underline font-semibold">View Dossier</router-link>
                        <span class="text-border-brass">·</span>
                        <a :href="c.originalCompassUrl" target="_blank" class="text-charcoal-muted hover:text-primary">Compass</a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-[11px] text-charcoal-muted mt-2">Showing 10 of {{ properties.filter(p => p.isCompassListing).length }} Compass-verified properties.</p>
          </div>
        </div>
      </div>

      <!-- TAB 3: INQUIRIES & LEADS -->
      <div v-if="activeTab === 'leads'" class="space-y-6">
        <div class="bg-canvas-white border border-border-subtle p-6 rounded shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <span class="text-xs uppercase tracking-widest text-secondary font-semibold block mb-1">Confidential Client Dossiers</span>
              <h2 class="font-headline text-2xl text-primary">Private Advisory Inquiries & Leads</h2>
            </div>
            <button
              @click="exportCSV"
              class="px-4 py-2 bg-primary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-secondary flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
            >
              <span class="material-symbols-outlined text-base">download</span>
              <span>Export CSV (CRM)</span>
            </button>
          </div>

          <div v-if="inquiries.length > 0" class="divide-y divide-border-subtle mt-4">
            <div
              v-for="lead in inquiries"
              :key="lead.id"
              :class="['py-4 flex flex-col md:flex-row md:items-center justify-between gap-4', lead.status === 'New' ? 'bg-surface-linen/30 -mx-4 px-4 rounded' : '']"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-primary text-sm">{{ lead.name }}</span>
                  <span
                    :class="[
                      'px-2 py-0.5 text-[10px] uppercase font-bold rounded',
                      lead.status === 'New' ? 'bg-secondary text-canvas-white' :
                      lead.status === 'Contacted' ? 'bg-status-active text-canvas-white' :
                      'bg-surface-linen text-charcoal-muted'
                    ]"
                  >
                    {{ lead.status }}
                  </span>
                  <span class="text-xs text-charcoal-muted">· {{ lead.type }}</span>
                </div>
                <div class="text-xs text-charcoal-muted flex flex-wrap gap-x-4 gap-y-1">
                  <span>{{ lead.email }}</span>
                  <span>{{ lead.phone }}</span>
                  <span v-if="lead.neighborhood">Submarket: {{ lead.neighborhood }}</span>
                </div>
                <p v-if="lead.message" class="text-xs text-charcoal-body mt-1 bg-surface-alabaster p-2 rounded border border-border-subtle">
                  "{{ lead.message }}"
                </p>
                <span class="text-[10px] text-charcoal-muted block">{{ new Date(lead.timestamp).toLocaleString() }}</span>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  v-if="lead.status !== 'Contacted'"
                  @click="updateStatus(lead.id, 'Contacted'); emit('toast', 'Lead marked as contacted.', 'success')"
                  class="px-3 py-1.5 bg-canvas-white border border-border-subtle text-xs rounded hover:bg-surface-linen text-charcoal-body font-semibold"
                >
                  Mark Contacted
                </button>
                <button
                  v-if="lead.status !== 'Archived'"
                  @click="updateStatus(lead.id, 'Archived'); emit('toast', 'Lead archived.', 'info')"
                  class="px-3 py-1.5 bg-canvas-white border border-border-subtle text-xs rounded hover:bg-surface-linen text-charcoal-muted"
                >
                  Archive
                </button>
                <button
                  @click="deleteInquiry(lead.id); emit('toast', 'Inquiry deleted.', 'info')"
                  class="p-1.5 text-charcoal-muted hover:text-red-600 rounded"
                  title="Delete Lead"
                >
                  <span class="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-charcoal-muted">
            <span class="material-symbols-outlined text-4xl mb-2">mark_email_read</span>
            <p class="font-headline text-lg text-primary">No inquiries recorded yet.</p>
            <p class="text-xs">Client submissions from the homepage and listing inquiry modals will appear here.</p>
          </div>
        </div>
      </div>

      <!-- TAB 4: CLOUDFLARE 8 GB STORAGE GUARD -->
      <div v-if="activeTab === 'storage'" class="space-y-6">
        <div class="bg-canvas-white border border-border-subtle p-6 rounded shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <span class="text-xs uppercase tracking-widest text-secondary font-semibold block mb-1">Infrastructure Guard</span>
              <h2 class="font-headline text-2xl text-primary">Cloudflare Free Tier Quota Management</h2>
              <p class="text-xs text-charcoal-muted mt-1">
                Monitors portfolio media against an 8.0 GB safety threshold before unexpected Cloudflare billing triggers.
              </p>
            </div>
            <div class="text-right">
              <span class="text-xs uppercase tracking-widest text-charcoal-muted font-semibold block">Quota Status</span>
              <span class="text-sm font-semibold text-status-active">Within Free Tier Limit</span>
            </div>
          </div>

          <!-- Progress Bar & Stats -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-semibold">
              <span>{{ formatBytes(currentBytes) }} Used</span>
              <span>{{ storagePercentage }}% of {{ storageThresholdGB }} GB Limit</span>
            </div>
            <div class="w-full bg-surface-linen h-3 rounded-full overflow-hidden">
              <div
                class="h-full bg-secondary transition-all duration-500 rounded-full"
                :style="{ width: storagePercentage + '%' }"
              ></div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <span class="text-[10px] uppercase font-bold text-charcoal-muted block mb-1">Cloudflare Free Tier</span>
              <span class="font-headline text-xl text-primary">10.0 GB Total</span>
              <p class="text-[11px] text-charcoal-muted mt-1">Standard free tier allowance on Cloudflare R2 & Workers.</p>
            </div>
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <span class="text-[10px] uppercase font-bold text-charcoal-muted block mb-1">Safety Threshold</span>
              <span class="font-headline text-xl text-secondary">{{ storageThresholdGB }} GB Active</span>
              <p class="text-[11px] text-charcoal-muted mt-1">Uploads halt when threshold is reached to prevent auto-billing.</p>
            </div>
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <span class="text-[10px] uppercase font-bold text-charcoal-muted block mb-1">Compass Cached Footprint</span>
              <span class="font-headline text-xl text-status-active">3.89 MB (39 Photos)</span>
              <p class="text-[11px] text-charcoal-muted mt-1">Ultra-compressed WebP format keeps storage footprint near zero.</p>
            </div>
          </div>

          <!-- Quota Control Actions -->
          <div class="border-t border-border-subtle pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <h4 class="text-xs uppercase font-semibold text-primary mb-1">Threshold Configuration</h4>
              <p class="text-[11px] text-charcoal-muted mb-3">Adjust the alert limit (default 8.0 GB, max 10.0 GB on free tier).</p>
              <div class="flex gap-2">
                <input
                  v-model.number="storageThresholdGB"
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  class="w-24 px-3 py-1.5 text-xs bg-canvas-white border border-border-subtle rounded"
                />
                <button
                  @click="setThreshold(storageThresholdGB); emit('toast', 'Threshold updated to ' + storageThresholdGB + ' GB', 'success')"
                  class="px-3 py-1.5 bg-primary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-secondary"
                >
                  Save Limit
                </button>
              </div>
            </div>

            <!-- Paid Upgrade Option -->
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <h4 class="text-xs uppercase font-semibold text-primary mb-1">Buy Cloudflare Data Tier</h4>
              <p class="text-[11px] text-charcoal-muted mb-3">Upgrade to Cloudflare paid R2 tier ($0.015/GB/mo, zero egress fees) and expand limit to 50 GB.</p>
              <button
                @click="setUpgraded(true, 50.0); emit('toast', 'Account set to 50 GB Cloudflare tier.', 'success')"
                class="px-4 py-2 bg-secondary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-primary transition-colors shadow-sm"
              >
                Expand to 50 GB Tier
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 5: SITE CUSTOMIZER -->
      <div v-if="activeTab === 'settings'" class="space-y-6">
        <div class="bg-canvas-white border border-border-subtle p-6 rounded shadow-sm">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle">
            <div>
              <span class="text-xs uppercase tracking-widest text-secondary font-semibold block mb-1">Continuous Customization</span>
              <h2 class="font-headline text-2xl text-primary">Branding & Advisory Credentials</h2>
            </div>
            <div class="flex gap-2">
              <button
                @click="handleResetSettings"
                class="px-3 py-1.5 text-xs uppercase tracking-wider border border-border-subtle rounded hover:bg-surface-linen font-semibold"
              >
                Reset Defaults
              </button>
              <button
                @click="handleSaveSettings"
                class="px-5 py-1.5 bg-primary text-canvas-white text-xs uppercase tracking-wider rounded hover:bg-secondary font-semibold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>

          <form @submit.prevent="handleSaveSettings" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1.5">Advisor Name</label>
                <input v-model="settingsForm.advisorName" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
              </div>
              <div>
                <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1.5">Direct Phone</label>
                <input v-model="settingsForm.phone" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
              </div>
              <div>
                <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1.5">Primary Email</label>
                <input v-model="settingsForm.email" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1.5">Brokerage Entity Name</label>
                <input v-model="settingsForm.brokerage" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
              </div>
              <div>
                <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1.5">Office Address</label>
                <input v-model="settingsForm.officeAddress" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
              </div>
            </div>

            <!-- Luxury Design Template Themes (A/B Testing) -->
            <div class="border-t border-border-subtle pt-4">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <label class="block text-xs uppercase font-semibold text-primary">Luxury Design Template Themes</label>
                  <span class="text-[11px] text-charcoal-muted">Switch themes live or share targeted URLs with ?template=id to A/B test impressions</span>
                </div>
                <span class="text-[10px] px-2 py-0.5 bg-secondary text-canvas-white rounded font-bold uppercase">4 Styles Active</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div
                  v-for="t in templates"
                  :key="t.id"
                  @click="handleTemplateSelect(t.id)"
                  :class="[
                    'p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between',
                    currentTemplate === t.id
                      ? 'border-secondary bg-surface-linen/80 ring-2 ring-secondary/50 shadow-sm'
                      : 'border-border-subtle hover:border-border-brass bg-surface-alabaster'
                  ]"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <span class="w-4 h-4 rounded-full border border-black/10 shrink-0" :style="{ backgroundColor: t.previewColor }"></span>
                    <span class="text-xs font-semibold text-primary leading-tight">{{ t.name }}</span>
                  </div>
                  <span class="text-[10px] text-charcoal-muted line-clamp-1 mb-2">{{ t.tagline }}</span>
                  <div class="flex items-center justify-between pt-1 border-t border-border-subtle/60 text-[10px]">
                    <span class="font-mono text-secondary font-bold">?template={{ t.id }}</span>
                    <span v-if="currentTemplate === t.id" class="text-status-active font-bold">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Typography Selector -->
            <div class="border-t border-border-subtle pt-4">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <label class="block text-xs uppercase font-semibold text-primary">Headline Typography Style</label>
                  <span class="text-[11px] text-charcoal-muted">Choose your preferred luxury headline font for the entire website</span>
                </div>
              </div>
              <select
                v-model="settingsForm.fontFamily"
                class="w-full px-3.5 py-2.5 text-sm bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary font-semibold"
              >
                <option value="'Playfair Display', serif">Playfair Display (Prestigious Editorial Luxury — Bold, High Legibility Serif)</option>
                <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Modern Architectural Clean — Ultra-Crisp Sans-Serif)</option>
                <option value="'Cormorant Garamond', serif">Cormorant Garamond (Classical High-End Estate Atelier)</option>
                <option value="'Cinzel', serif">Cinzel (Roman Inscription Grandeur)</option>
              </select>
            </div>

            <div class="space-y-3 pt-2">
              <label class="block text-xs uppercase font-semibold text-charcoal-muted">Hero Headline</label>
              <input v-model="settingsForm.heroHeading" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded font-headline" />
              <label class="block text-xs uppercase font-semibold text-charcoal-muted">Hero Subtitle</label>
              <textarea v-model="settingsForm.heroSubheading" rows="3" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded"></textarea>
            </div>

            <!-- Metrics Strip Customizer -->
            <div class="border-t border-border-subtle pt-4">
              <h4 class="text-xs uppercase font-semibold text-primary mb-3">Homepage 4-Metric Strip</h4>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-surface-alabaster p-3 border border-border-subtle rounded">
                  <input v-model="settingsForm.stat1Value" class="w-full px-2 py-1 text-xs bg-canvas-white border rounded font-semibold mb-1" />
                  <input v-model="settingsForm.stat1Label" class="w-full px-2 py-1 text-[10px] bg-canvas-white border rounded text-charcoal-muted" />
                </div>
                <div class="bg-surface-alabaster p-3 border border-border-subtle rounded">
                  <input v-model="settingsForm.stat2Value" class="w-full px-2 py-1 text-xs bg-canvas-white border rounded font-semibold mb-1" />
                  <input v-model="settingsForm.stat2Label" class="w-full px-2 py-1 text-[10px] bg-canvas-white border rounded text-charcoal-muted" />
                </div>
                <div class="bg-surface-alabaster p-3 border border-border-subtle rounded">
                  <input v-model="settingsForm.stat3Value" class="w-full px-2 py-1 text-xs bg-canvas-white border rounded font-semibold mb-1" />
                  <input v-model="settingsForm.stat3Label" class="w-full px-2 py-1 text-[10px] bg-canvas-white border rounded text-charcoal-muted" />
                </div>
                <div class="bg-surface-alabaster p-3 border border-border-subtle rounded">
                  <input v-model="settingsForm.stat4Value" class="w-full px-2 py-1 text-xs bg-canvas-white border rounded font-semibold mb-1" />
                  <input v-model="settingsForm.stat4Label" class="w-full px-2 py-1 text-[10px] bg-canvas-white border rounded text-charcoal-muted" />
                </div>
              </div>
            </div>

            <!-- Admin Passcode Security Setting -->
            <div class="border-t border-border-subtle pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label class="block text-xs uppercase font-semibold text-primary">Admin Console Passcode</label>
                <span class="text-[11px] text-charcoal-muted">Protects this management console and inquiries inbox from visitors</span>
              </div>
              <input
                v-model="settingsForm.adminPasscode"
                type="text"
                class="w-48 px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded font-mono text-center"
              />
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Edit Property Modal -->
    <div v-if="isEditModalOpen && selectedPropertyForEdit" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm">
      <div class="bg-canvas-white border border-border-brass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 class="font-headline text-xl text-primary">Edit Property Dossier</h3>
          <button @click="isEditModalOpen = false" class="text-charcoal-muted hover:text-primary">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="savePropertyEdit" class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block uppercase font-semibold text-charcoal-muted mb-1">Title</label>
              <input v-model="selectedPropertyForEdit.title" class="w-full p-2 bg-surface-alabaster border rounded" required />
            </div>
            <div>
              <label class="block uppercase font-semibold text-charcoal-muted mb-1">Address</label>
              <input v-model="selectedPropertyForEdit.address" class="w-full p-2 bg-surface-alabaster border rounded" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block uppercase font-semibold text-charcoal-muted mb-1">Price ($)</label>
              <input v-model.number="selectedPropertyForEdit.price" type="number" class="w-full p-2 bg-surface-alabaster border rounded" required />
            </div>
            <div>
              <label class="block uppercase font-semibold text-charcoal-muted mb-1">Neighborhood</label>
              <input v-model="selectedPropertyForEdit.neighborhood" class="w-full p-2 bg-surface-alabaster border rounded" required />
            </div>
            <div>
              <label class="block uppercase font-semibold text-charcoal-muted mb-1">Status</label>
              <select v-model="selectedPropertyForEdit.status" class="w-full p-2 bg-surface-alabaster border rounded">
                <option value="Active Exclusive">Active Exclusive</option>
                <option value="Private Exclusive">Private Exclusive</option>
                <option value="Sold Portfolio">Sold Portfolio</option>
                <option value="Leased">Leased</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block uppercase font-semibold text-charcoal-muted mb-1">Beds</label>
              <input v-model.number="selectedPropertyForEdit.bedrooms" type="number" class="w-full p-2 bg-surface-alabaster border rounded" />
            </div>
            <div>
              <label class="block uppercase font-semibold text-charcoal-muted mb-1">Baths</label>
              <input v-model.number="selectedPropertyForEdit.bathrooms" type="number" step="0.5" class="w-full p-2 bg-surface-alabaster border rounded" />
            </div>
            <div>
              <label class="block uppercase font-semibold text-charcoal-muted mb-1">Sq Ft</label>
              <input v-model.number="selectedPropertyForEdit.sqft" type="number" class="w-full p-2 bg-surface-alabaster border rounded" />
            </div>
          </div>

          <div>
            <label class="block uppercase font-semibold text-charcoal-muted mb-1">Description</label>
            <textarea v-model="selectedPropertyForEdit.description" rows="4" class="w-full p-2 bg-surface-alabaster border rounded"></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t">
            <button type="button" @click="isEditModalOpen = false" class="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" class="px-5 py-2 bg-primary text-canvas-white rounded font-semibold hover:bg-secondary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Storage Limit Modal -->
    <StorageLimitModal />
  </div>
</template>
