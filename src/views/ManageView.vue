<script setup>
import { ref, computed } from "vue";
import { useProperties } from "../composables/useProperties";
import { useInquiries } from "../composables/useInquiries";
import { useSiteSettings } from "../composables/useSiteSettings";
import { useStorageQuota } from "../composables/useStorageQuota";
import StorageLimitModal from "../components/StorageLimitModal.vue";

const emit = defineEmits(["toast"]);

const { properties, updateProperty, deleteProperty, toggleStatus, resetToDefaults, exportJSON, importJSON } = useProperties();
const { inquiries, unreadCount, updateStatus, deleteInquiry, exportCSV } = useInquiries();
const { siteSettings, saveSettings, resetSettings, verifyPasscode } = useSiteSettings();
const { storageThresholdGB, isUpgraded, calculateTotalBytes, formatBytes, setThreshold, setUpgraded } = useStorageQuota();

// Authentication Gate
const isAuthenticated = ref(sessionStorage.getItem("kyle_admin_auth") === "true");
const passcodeInput = ref("");
const authError = ref(false);

function handleLogin() {
  if (verifyPasscode(passcodeInput.value)) {
    isAuthenticated.value = true;
    sessionStorage.setItem("kyle_admin_auth", "true");
    authError.value = false;
    emit("toast", "Welcome back, " + siteSettings.value.advisorName, "success");
  } else {
    authError.value = true;
  }
}

function handleLogout() {
  isAuthenticated.value = false;
  sessionStorage.removeItem("kyle_admin_auth");
  passcodeInput.value = "";
}

// Active Tab
const activeTab = ref("properties"); // 'properties', 'leads', 'storage', 'settings'

// Properties Tab State
const propSearch = ref("");
const statusFilter = ref("all");
const selectedPropertyForEdit = ref(null);
const isEditModalOpen = ref(false);

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
          <h1 class="font-headline text-2xl sm:text-3xl text-primary">{{ siteSettings.advisorName }} Advisory Dashboard</h1>
        </div>
        <div class="flex flex-wrap items-center gap-2">
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
            to="/submit"
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
            <span class="text-[11px] uppercase tracking-wider text-charcoal-muted font-semibold block">Private / Pending</span>
            <span class="font-headline text-2xl text-secondary font-medium">{{ properties.filter(p => p.status === 'Private Exclusive' || p.status === 'Pending').length }}</span>
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
              <option value="Pending">Pending</option>
              <option value="Sold">Sold</option>
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
                <th class="p-4">Enclave</th>
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
                    <img :src="p.heroImage" class="w-12 h-10 object-cover rounded bg-surface-linen shrink-0" />
                    <div>
                      <span class="font-semibold text-primary block truncate max-w-xs">{{ p.title }}</span>
                      <span class="text-charcoal-muted text-[11px] block truncate max-w-xs">{{ p.address }}</span>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-charcoal-muted font-medium">{{ p.neighborhood }}</td>
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
                    <option value="Pending">Pending</option>
                    <option value="Sold">Sold</option>
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
          <span>Showing {{ filteredProperties.length }} of {{ properties.length }} properties in LocalStorage</span>
          <button @click="resetToDefaults" class="text-xs text-charcoal-muted hover:text-red-600 underline">
            Reset to Sample Data
          </button>
        </div>
      </div>

      <!-- Quick Edit Modal -->
      <div v-if="isEditModalOpen && selectedPropertyForEdit" class="fixed inset-0 z-50 bg-primary/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-canvas-white border border-border-brass max-w-xl w-full rounded-lg shadow-2xl p-6 relative">
          <button @click="isEditModalOpen = false" class="absolute top-4 right-4 text-charcoal-muted hover:text-primary">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
          <h3 class="font-headline text-xl text-primary mb-4">Edit Listing Dossier</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1">Title</label>
              <input v-model="selectedPropertyForEdit.title" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
            </div>
            <div>
              <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1">Price ($)</label>
              <input v-model.number="selectedPropertyForEdit.price" type="number" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1">Bedrooms</label>
                <input v-model.number="selectedPropertyForEdit.bedrooms" type="number" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
              </div>
              <div>
                <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1">Bathrooms</label>
                <input v-model.number="selectedPropertyForEdit.bathrooms" type="number" step="0.5" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded" />
              </div>
            </div>
            <div>
              <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1">Status</label>
              <select v-model="selectedPropertyForEdit.status" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded">
                <option value="Active Exclusive">Active Exclusive</option>
                <option value="Private Exclusive">Private Exclusive</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
            <div>
              <label class="block text-xs uppercase font-semibold text-charcoal-muted mb-1">Description</label>
              <textarea v-model="selectedPropertyForEdit.description" rows="3" class="w-full px-3 py-2 text-sm bg-surface-alabaster border border-border-subtle rounded"></textarea>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="isEditModalOpen = false" class="px-4 py-2 border border-border-subtle rounded text-xs uppercase tracking-wider font-semibold">Cancel</button>
            <button @click="savePropertyEdit" class="px-4 py-2 bg-primary text-canvas-white rounded text-xs uppercase tracking-wider font-semibold hover:bg-secondary">Save Changes</button>
          </div>
        </div>
      </div>
      <!-- TAB 2: INQUIRIES & LEADS INBOX -->
      <div v-if="activeTab === 'leads'" class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-headline text-xl text-primary font-semibold">Client Inquiry Dossiers</h2>
            <p class="text-xs text-charcoal-muted">Submissions captured from showings, consultation requests, and listing portals.</p>
          </div>
          <button
            @click="exportCSV"
            class="px-4 py-2 bg-primary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-secondary flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span class="material-symbols-outlined text-base">table_view</span>
            <span>Export Leads to CSV</span>
          </button>
        </div>

        <div v-if="inquiries.length > 0" class="space-y-3">
          <div
            v-for="lead in inquiries"
            :key="lead.id"
            class="bg-canvas-white border border-border-subtle hover:border-border-brass p-5 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-headline text-lg font-semibold text-primary">{{ lead.name }}</span>
                <span
                  :class="[
                    'px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded',
                    lead.status === 'New' ? 'bg-[#E9EFEA] text-status-active' :
                    lead.status === 'Contacted' ? 'bg-secondary text-canvas-white' :
                    'bg-surface-linen text-charcoal-muted'
                  ]"
                >
                  {{ lead.status }}
                </span>
                <span class="text-[10px] text-secondary font-semibold uppercase tracking-wider border border-border-brass px-2 py-0.5 rounded">
                  {{ lead.type }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-4 text-xs text-charcoal-muted pt-1">
                <a :href="'tel:' + lead.phone" class="hover:text-primary flex items-center gap-1 font-semibold">
                  <span class="material-symbols-outlined text-sm">phone</span> {{ lead.phone }}
                </a>
                <a :href="'mailto:' + lead.email" class="hover:text-primary flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">email</span> {{ lead.email }}
                </a>
                <span v-if="lead.neighborhood" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">location_on</span> {{ lead.neighborhood }}
                </span>
                <span class="text-[11px] text-charcoal-muted">{{ new Date(lead.createdAt).toLocaleDateString() }}</span>
              </div>
              <p v-if="lead.message" class="text-xs text-charcoal-body bg-surface-linen p-2.5 rounded mt-2 border border-border-subtle">
                <strong>Notes / Objective:</strong> {{ lead.objective ? `[${lead.objective}] ` : '' }}{{ lead.message }}
              </p>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-end md:self-center">
              <select
                :value="lead.status"
                @change="updateStatus(lead.id, $event.target.value)"
                class="px-2.5 py-1.5 text-xs bg-surface-alabaster border border-border-subtle rounded font-semibold text-primary focus:outline-none focus:border-secondary"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Archived">Archived</option>
              </select>
              <button
                @click="deleteInquiry(lead.id)"
                class="p-2 text-charcoal-muted hover:text-red-600 rounded hover:bg-surface-linen transition-colors"
                title="Delete Inquiry"
              >
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-16 bg-surface-linen border border-border-subtle rounded p-8">
          <span class="material-symbols-outlined text-4xl text-charcoal-muted mb-2">mark_email_read</span>
          <p class="font-headline text-xl text-primary">No inquiries in your dossier inbox.</p>
          <p class="text-xs text-charcoal-muted mt-1">Submissions from prospective clients will appear here automatically.</p>
        </div>
      </div>

      <!-- TAB 3: CLOUDFLARE 8 GB STORAGE GUARD -->
      <div v-if="activeTab === 'storage'" class="space-y-6">
        <div class="bg-canvas-white border border-border-subtle p-6 rounded shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-xs uppercase tracking-widest text-secondary font-semibold block mb-1">Quota Enforcer</span>
              <h2 class="font-headline text-2xl text-primary">Cloudflare R2 & Media Storage Meter</h2>
            </div>
            <span
              :class="[
                'px-3 py-1 text-xs uppercase tracking-wider font-bold rounded',
                storagePercentage >= 90 ? 'bg-red-100 text-red-800' :
                storagePercentage >= 70 ? 'bg-amber-100 text-amber-800' :
                'bg-[#E9EFEA] text-status-active'
              ]"
            >
              {{ storagePercentage >= 90 ? 'Critical' : storagePercentage >= 70 ? 'Warning' : 'Healthy' }}
            </span>
          </div>

          <!-- Progress Meter -->
          <div class="space-y-2 mb-6">
            <div class="flex justify-between text-xs text-charcoal-muted font-semibold">
              <span>{{ currentGB }} GB used</span>
              <span>{{ storageThresholdGB }} GB Free Tier Guard</span>
            </div>
            <div class="w-full h-3 bg-surface-linen rounded-full overflow-hidden border border-border-subtle">
              <div
                :style="{ width: storagePercentage + '%' }"
                :class="[
                  'h-full transition-all duration-500',
                  storagePercentage >= 90 ? 'bg-red-600' :
                  storagePercentage >= 70 ? 'bg-amber-500' :
                  'bg-secondary'
                ]"
              ></div>
            </div>
          </div>

          <p class="text-xs text-charcoal-muted leading-relaxed mb-6">
            Cloudflare R2 provides 10 GB/month on its free tier. This guard actively monitors cumulative media footprints and automatically prevents uploads once the <strong>{{ storageThresholdGB }} GB limit</strong> is reached, preventing surprise egress or storage fees.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border-subtle pt-6">
            <!-- Threshold Adjustment -->
            <div class="bg-surface-alabaster p-4 border border-border-subtle rounded">
              <h4 class="text-xs uppercase font-semibold text-primary mb-1">Safety Threshold Level</h4>
              <p class="text-[11px] text-charcoal-muted mb-3">Adjust the storage threshold at which new uploads are halted.</p>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="storageThresholdGB"
                  @change="setThreshold(storageThresholdGB)"
                  type="number"
                  step="0.5"
                  min="1"
                  max="500"
                  class="w-24 px-3 py-1.5 text-xs bg-canvas-white border border-border-subtle rounded"
                />
                <span class="text-xs font-semibold text-charcoal-muted">GB</span>
                <button
                  @click="setThreshold(storageThresholdGB); emit('toast', 'Storage threshold updated.', 'success')"
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

      <!-- TAB 4: SITE CUSTOMIZER -->
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

    <!-- Storage Limit Modal -->
    <StorageLimitModal />
  </div>
</template>
