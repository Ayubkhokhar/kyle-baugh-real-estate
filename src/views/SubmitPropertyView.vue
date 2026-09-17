<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useProperties } from "../composables/useProperties";
import { useInquiries } from "../composables/useInquiries";
import { useSiteSettings } from "../composables/useSiteSettings";
import { useStorageQuota } from "../composables/useStorageQuota";
import { optimizeImage } from "../services/imageOptimizer";
import StorageLimitModal from "../components/StorageLimitModal.vue";

const router = useRouter();
const { addProperty, properties } = useProperties();
const { addInquiry } = useInquiries();
const { siteSettings } = useSiteSettings();
const { checkUploadQuota, formatBytes } = useStorageQuota();

const emit = defineEmits(["toast"]);

const form = ref({
  address: "",
  unit: "",
  neighborhood: "park-cities",
  typology: "Single Family",
  bedrooms: 4,
  bathrooms: 4.5,
  sqft: "",
  lotSize: "0.35 Acres",
  garage: "2-Car Attached",
  yearBuilt: 2020,
  goal: "sell",
  timeline: "immediate",
  price: "",
  description: "",
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  contactPref: "call",
});

const uploadedImages = ref([]);
const isProcessingImages = ref(false);
const cdnUrlInput = ref("");
const isSubmitting = ref(false);
const submittedPropertyId = ref(null);
const isSuccess = ref(false);

async function handleFilesSelected(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  // 1. Calculate incoming bytes to check against 8 GB quota guard!
  const incomingBytes = files.reduce((acc, f) => acc + f.size, 0);
  const quotaCheck = checkUploadQuota(incomingBytes, properties.value);

  if (!quotaCheck.allowed) {
    emit("toast", "Upload paused: 8 GB Cloudflare threshold reached.", "error");
    return;
  }

  isProcessingImages.value = true;
  try {
    for (const file of files) {
      const optimized = await optimizeImage(file);
      uploadedImages.value.push({
        url: optimized.dataUrl,
        title: file.name.replace(/\.[^/.]+$/, ""),
        caption: `Uploaded photograph (${optimized.compressedMB} MB)`,
        sizeBytes: optimized.compressedSize,
      });
    }
    emit("toast", `${files.length} photo(s) optimized & attached.`, "success");
  } catch (err) {
    emit("toast", "Image optimization failed: " + err.message, "error");
  } finally {
    isProcessingImages.value = false;
    event.target.value = "";
  }
}

function addCdnUrl() {
  if (!cdnUrlInput.value.trim().startsWith("http")) {
    emit("toast", "Please enter a valid HTTP/HTTPS image URL", "error");
    return;
  }
  uploadedImages.value.push({
    url: cdnUrlInput.value.trim(),
    title: "Cloudflare / CDN Asset",
    caption: "Direct cloud hosted asset",
    sizeBytes: 500000,
  });
  cdnUrlInput.value = "";
  emit("toast", "Cloudflare image URL attached.", "success");
}

function removeImage(idx) {
  uploadedImages.value.splice(idx, 1);
}

function setCover(idx) {
  if (idx <= 0) return;
  const [target] = uploadedImages.value.splice(idx, 1);
  uploadedImages.value.unshift(target);
  emit("toast", "Cover image updated.", "info");
}

function handleSubmit() {
  isSubmitting.value = true;
  setTimeout(() => {
    const rawPrice = String(form.value.price).replace(/[^0-9]/g, "");
    const priceNum = Number(rawPrice) || 1500000;
    const rawSqft = String(form.value.sqft).replace(/[^0-9]/g, "");
    const sqftNum = Number(rawSqft) || 3500;

    const heroImage = uploadedImages.value[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";

    // 1. Save property
    const newProp = addProperty({
      title: form.value.address,
      address: form.value.address + (form.value.unit ? " " + form.value.unit : ""),
      neighborhood: form.value.neighborhood.replace("-", " ").toUpperCase(),
      enclaveCategory: form.value.neighborhood,
      price: priceNum,
      sqft: sqftNum,
      bedrooms: form.value.bedrooms,
      bathrooms: form.value.bathrooms,
      lotSize: form.value.lotSize,
      garage: form.value.garage,
      yearBuilt: form.value.yearBuilt,
      typology: form.value.typology,
      heroImage,
      gallery: uploadedImages.value,
      tagline: `Dallas ${form.value.typology} Residence in ${form.value.neighborhood}`,
      description: form.value.description || `Offered for ${form.value.goal.toUpperCase()} representation by ${siteSettings.value.advisorName}.`,
      status: form.value.goal === "private" ? "Private Exclusive" : "Active Exclusive",
      featured: true,
    });

    // 2. Save lead into Inquiries Inbox
    addInquiry({
      name: form.value.clientName,
      email: form.value.clientEmail,
      phone: form.value.clientPhone,
      type: "Property Submission Dossier",
      propertyAddress: newProp.address,
      neighborhood: form.value.neighborhood,
      objective: `Listing Submission: ${form.value.goal.toUpperCase()} (Timeline: ${form.value.timeline})`,
      message: `Preferred Contact: ${form.value.contactPref}. Estimated Target: $${priceNum.toLocaleString()}. Notes: ${form.value.description}`,
    });

    submittedPropertyId.value = newProp.id;
    isSuccess.value = true;
    isSubmitting.value = false;
    emit("toast", "Property submitted successfully and saved to LocalStorage!", "success");
  }, 500);
}
</script>

<template>
  <div class="bg-surface-alabaster min-h-screen pb-24 pt-7 px-5">
    <div class="max-w-2xl mx-auto">
      <!-- Breadcrumb badge -->
      <div class="flex items-center justify-between mb-4">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-linen border border-border-subtle rounded-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-status-active"></span>
          <span class="text-xs uppercase tracking-widest font-semibold text-charcoal-body">Submit Property Advisory</span>
        </div>
        <span class="text-xs uppercase tracking-widest text-charcoal-muted font-semibold">Compass Luxury</span>
      </div>

      <!-- Hero Header -->
      <section class="mb-8">
        <h1 class="font-headline text-3xl sm:text-4xl text-primary tracking-tight mb-3">
          Sell or Lease with {{ siteSettings.advisorName }}
        </h1>
        <p class="text-sm sm:text-base text-charcoal-muted leading-relaxed font-light">
          Maximize your home\'s market value with Dallas\'s premier construction-backed real estate advisor.
        </p>

        <!-- Micro Profile Chip -->
        <div class="mt-6 p-4 bg-canvas-white border border-border-subtle rounded flex items-center gap-4 shadow-sm">
          <div class="w-14 h-14 rounded-full overflow-hidden border border-border-brass shrink-0">
            <img
              class="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbzZ3D5Im9atRdJnC11mRDzxiAkcPytz-M-qK5Izl5DFhKjM0W_z1-iy-xCdgOai9bjm8j1TymYZJktpINXi55eMV6_SiMkAzu-sHFckSB3xxTquDEkx4kQ48pWb8waZCOg0rlgi9LWjKPmIoqD0n8duflj5GHLgrdzi9R90D1VUk9L3B19MdMWnSNPE-QruCORv2N9-ktA_Dw0U4_bVG7M0oJLQntJcWVRGaH1oPx2JRIfaStsEaykA"
              :alt="siteSettings.advisorName"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h2 class="font-headline text-base sm:text-lg text-primary truncate font-semibold">{{ siteSettings.advisorName }}</h2>
              <span class="text-[10px] uppercase tracking-wider text-secondary font-bold">REALTOR®</span>
            </div>
            <p class="text-xs text-charcoal-muted truncate">Over $240M+ Transaction Volume · Park Cities & Lakewood</p>
            <div class="flex items-center gap-2 mt-1 text-charcoal-muted text-[10px] tracking-wider uppercase font-semibold">
              <span>BS, Construction Science</span>
              <span>·</span>
              <span>Compass Exclusives</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Success Screen -->
      <section v-if="isSuccess" class="bg-canvas-white border border-border-brass rounded p-8 sm:p-10 text-center shadow-xl">
        <div class="w-16 h-16 rounded-full bg-[#E9EFEA] text-status-active mx-auto mb-4 flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h2 class="font-headline text-2xl sm:text-3xl text-primary mb-2">Property Dossier Transmitted</h2>
        <p class="text-xs text-charcoal-muted max-w-md mx-auto mb-8 leading-relaxed">
          Your property has been successfully recorded in LocalStorage and submitted to {{ siteSettings.advisorName }}\'s Advisory Inbox.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <router-link
            :to="'/property/' + submittedPropertyId"
            class="w-full sm:w-auto px-6 py-3 bg-primary text-canvas-white text-xs uppercase tracking-widest font-semibold hover:bg-secondary transition-colors rounded shadow"
          >
            View Live Listing Dossier
          </router-link>
          <router-link
            to="/manage"
            class="w-full sm:w-auto px-6 py-3 bg-surface-linen text-primary border border-border-subtle text-xs uppercase tracking-widest font-semibold hover:bg-surface-alabaster transition-colors rounded"
          >
            Manage in Console
          </router-link>
          <button
            @click="isSuccess = false; uploadedImages = [];"
            class="w-full sm:w-auto px-6 py-3 text-xs uppercase tracking-widest text-charcoal-muted hover:text-primary font-semibold"
          >
            Submit Another
          </button>
        </div>
      </section>
      <!-- Multi-step Form -->
      <section v-else class="bg-canvas-white border border-border-subtle rounded-lg p-6 sm:p-8 shadow-xl">
        <div class="border-b border-border-subtle pb-4 mb-8">
          <span class="text-xs uppercase tracking-widest text-secondary font-semibold block mb-1">Confidential Inquiry</span>
          <h2 class="font-headline text-2xl sm:text-3xl text-primary">Property Dossier Submission</h2>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- STEP 1: Address & Location -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold w-5 h-5 rounded-full bg-primary text-canvas-white flex items-center justify-center">1</span>
              <h3 class="text-xs uppercase tracking-wider font-semibold text-primary">Property Address & Location</h3>
            </div>
            <div class="space-y-3">
              <div>
                <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-1.5">Street Address *</label>
                <input
                  v-model="form.address"
                  required
                  type="text"
                  placeholder="e.g. 3821 Shenandoah St or 5647 Swiss Ave"
                  class="w-full px-3.5 py-3 text-sm bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
                />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-1.5">Unit / Apt (Optional)</label>
                  <input
                    v-model="form.unit"
                    type="text"
                    placeholder="Suite 400"
                    class="w-full px-3.5 py-3 text-sm bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-1.5">Dallas Enclave *</label>
                  <select
                    v-model="form.neighborhood"
                    required
                    class="w-full px-3.5 py-3 text-sm bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
                  >
                    <option value="park-cities">Park Cities (HP & UP)</option>
                    <option value="preston-hollow">Preston Hollow</option>
                    <option value="lakewood">Lakewood & East Dallas</option>
                    <option value="uptown">Uptown & Turtle Creek</option>
                    <option value="bluffview">Bluffview & Devonshire</option>
                    <option value="historic">Swiss Avenue Historic District</option>
                    <option value="other">Other Greater Dallas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="h-px bg-border-subtle"></div>

          <!-- STEP 2: Specifications -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold w-5 h-5 rounded-full bg-primary text-canvas-white flex items-center justify-center">2</span>
              <h3 class="text-xs uppercase tracking-wider font-semibold text-primary">Property Specifications</h3>
            </div>
            <div>
              <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-2">Property Typology</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  v-for="type in ['Single Family', 'Historic Luxury', 'Townhome', 'Condo Penthouse']"
                  :key="type"
                  @click="form.typology = type"
                  :class="[
                    'border rounded p-3 text-center transition-colors text-xs uppercase tracking-wider font-semibold',
                    form.typology === type ? 'bg-surface-linen border-border-brass text-primary' : 'bg-surface-alabaster border-border-subtle text-charcoal-body hover:border-border-brass'
                  ]"
                >
                  {{ type }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="bg-surface-alabaster border border-border-subtle p-3 rounded">
                <span class="block text-xs uppercase text-charcoal-muted font-semibold mb-2">Bedrooms</span>
                <div class="flex items-center justify-between">
                  <button type="button" @click="form.bedrooms = Math.max(1, form.bedrooms - 1)" class="w-8 h-8 rounded border border-border-subtle bg-canvas-white text-primary flex items-center justify-center hover:bg-surface-linen">-</button>
                  <span class="font-headline text-lg">{{ form.bedrooms }}</span>
                  <button type="button" @click="form.bedrooms++" class="w-8 h-8 rounded border border-border-subtle bg-canvas-white text-primary flex items-center justify-center hover:bg-surface-linen">+</button>
                </div>
              </div>
              <div class="bg-surface-alabaster border border-border-subtle p-3 rounded">
                <span class="block text-xs uppercase text-charcoal-muted font-semibold mb-2">Bathrooms</span>
                <div class="flex items-center justify-between">
                  <button type="button" @click="form.bathrooms = Math.max(1, form.bathrooms - 0.5)" class="w-8 h-8 rounded border border-border-subtle bg-canvas-white text-primary flex items-center justify-center hover:bg-surface-linen">-</button>
                  <span class="font-headline text-lg">{{ form.bathrooms }}</span>
                  <button type="button" @click="form.bathrooms += 0.5" class="w-8 h-8 rounded border border-border-subtle bg-canvas-white text-primary flex items-center justify-center hover:bg-surface-linen">+</button>
                </div>
              </div>
              <div class="bg-surface-alabaster border border-border-subtle p-3 rounded">
                <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-2">Interior Sq Ft</label>
                <input v-model="form.sqft" type="text" placeholder="e.g. 4,750" class="w-full bg-transparent border-0 border-b border-border-subtle font-headline text-lg p-0 focus:ring-0 text-primary"/>
              </div>
            </div>
          </div>

          <div class="h-px bg-border-subtle"></div>

          <!-- STEP 3: Goals & Timeline -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold w-5 h-5 rounded-full bg-primary text-canvas-white flex items-center justify-center">3</span>
              <h3 class="text-xs uppercase tracking-wider font-semibold text-primary">Transaction Objectives</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label :class="['flex items-start gap-3 p-3.5 border rounded cursor-pointer transition-colors', form.goal === 'sell' ? 'bg-surface-linen border-border-brass' : 'bg-surface-alabaster border-border-subtle']">
                <input type="radio" v-model="form.goal" value="sell" class="mt-0.5 text-primary focus:ring-secondary"/>
                <div>
                  <span class="block text-xs uppercase font-semibold text-primary">Open Market Sale</span>
                  <span class="text-[11px] text-charcoal-muted block leading-normal">Full architectural photography, Compass Exclusives, & premier staging</span>
                </div>
              </label>
              <label :class="['flex items-start gap-3 p-3.5 border rounded cursor-pointer transition-colors', form.goal === 'concierge' ? 'bg-surface-linen border-border-brass' : 'bg-surface-alabaster border-border-subtle']">
                <input type="radio" v-model="form.goal" value="concierge" class="mt-0.5 text-primary focus:ring-secondary"/>
                <div>
                  <span class="block text-xs uppercase font-semibold text-primary">Concierge Remodel + Sale</span>
                  <span class="text-[11px] text-charcoal-muted block leading-normal">0% upfront capital for pre-sale high-ROI cosmetic updates</span>
                </div>
              </label>
              <label :class="['flex items-start gap-3 p-3.5 border rounded cursor-pointer transition-colors', form.goal === 'private' ? 'bg-surface-linen border-border-brass' : 'bg-surface-alabaster border-border-subtle']">
                <input type="radio" v-model="form.goal" value="private" class="mt-0.5 text-primary focus:ring-secondary"/>
                <div>
                  <span class="block text-xs uppercase font-semibold text-primary">Off-Market Private Exclusive</span>
                  <span class="text-[11px] text-charcoal-muted block leading-normal">Discreet representation shared solely with verified family offices</span>
                </div>
              </label>
              <label :class="['flex items-start gap-3 p-3.5 border rounded cursor-pointer transition-colors', form.goal === 'lease' ? 'bg-surface-linen border-border-brass' : 'bg-surface-alabaster border-border-subtle']">
                <input type="radio" v-model="form.goal" value="lease" class="mt-0.5 text-primary focus:ring-secondary"/>
                <div>
                  <span class="block text-xs uppercase font-semibold text-primary">Luxury Executive Lease</span>
                  <span class="text-[11px] text-charcoal-muted block leading-normal">Vetted high-net-worth tenant placement and ongoing lease advisory</span>
                </div>
              </label>
            </div>
          </div>

          <div class="h-px bg-border-subtle"></div>

          <!-- STEP 4: Valuation & Details -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold w-5 h-5 rounded-full bg-primary text-canvas-white flex items-center justify-center">4</span>
              <h3 class="text-xs uppercase tracking-wider font-semibold text-primary">Target Valuation & Narrative</h3>
            </div>
            <div class="bg-surface-alabaster border border-border-subtle p-4 rounded">
              <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-2">Estimated Market Valuation or Target Sale Price</label>
              <div class="relative flex items-center">
                <span class="absolute left-3 font-headline text-xl text-secondary">$</span>
                <input v-model="form.price" type="text" placeholder="2,250,000" class="w-full pl-8 pr-4 py-2.5 bg-canvas-white border border-border-subtle rounded font-headline text-xl text-primary focus:outline-none focus:border-secondary"/>
              </div>
            </div>
            <div>
              <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-1.5">Architectural Features & Narrative</label>
              <textarea v-model="form.description" rows="3" placeholder="Highlight any recent updates, pool, historic details, structural modifications..." class="w-full px-3.5 py-2.5 text-sm bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"></textarea>
            </div>
          </div>

          <div class="h-px bg-border-subtle"></div>

          <!-- STEP 5: Photos & 8 GB Quota Guard Dropzone -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold w-5 h-5 rounded-full bg-primary text-canvas-white flex items-center justify-center">5</span>
                <h3 class="text-xs uppercase tracking-wider font-semibold text-primary">Photos & Architectural Plans</h3>
              </div>
              <span class="text-[10px] text-secondary font-semibold uppercase tracking-wider">Cloudflare 8 GB Guard Active</span>
            </div>

            <!-- Drag & Drop Area -->
            <div class="border-2 border-dashed border-border-brass hover:border-secondary bg-surface-alabaster rounded p-6 text-center transition-colors group relative">
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                @change="handleFilesSelected"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div class="w-12 h-12 rounded-full bg-surface-linen border border-border-brass mx-auto mb-3 flex items-center justify-center group-hover:scale-105 transition-transform pointer-events-none">
                <span class="material-symbols-outlined text-secondary text-2xl">add_a_photo</span>
              </div>
              <p class="font-semibold text-primary text-sm mb-1 pointer-events-none">
                {{ isProcessingImages ? 'Optimizing Photos...' : 'Drop Property Photos Here or Browse' }}
              </p>
              <p class="text-xs text-charcoal-muted pointer-events-none">
                Client-side canvas compression ensures high quality while guarding under the 8 GB threshold.
              </p>
            </div>

            <!-- Direct Cloudflare / CDN URL Input -->
            <div class="flex gap-2">
              <input
                v-model="cdnUrlInput"
                type="url"
                placeholder="Or paste direct Cloudflare R2 / CDN image URL..."
                class="flex-1 px-3 py-2 text-xs bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"
              />
              <button
                type="button"
                @click="addCdnUrl"
                class="px-4 py-2 bg-surface-linen border border-border-subtle text-primary text-xs uppercase tracking-wider font-semibold rounded hover:bg-surface-alabaster transition-colors"
              >
                Attach URL
              </button>
            </div>

            <!-- Image Previews -->
            <div v-if="uploadedImages.length > 0" class="pt-2">
              <span class="text-xs uppercase tracking-wider text-charcoal-muted font-semibold block mb-2">
                Attached Images ({{ uploadedImages.length }})
              </span>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  v-for="(img, idx) in uploadedImages"
                  :key="idx"
                  class="relative aspect-[4/3] rounded overflow-hidden border border-border-subtle group shadow-sm bg-surface-linen"
                >
                  <img :src="img.url" class="w-full h-full object-cover" />
                  <span v-if="idx === 0" class="absolute top-1.5 left-1.5 px-2 py-0.5 bg-primary text-canvas-white text-[9px] uppercase tracking-wider font-bold rounded">Cover</span>
                  <div class="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" @click="setCover(idx)" v-if="idx !== 0" title="Set as Cover" class="p-1.5 bg-canvas-white text-primary rounded-full hover:bg-secondary hover:text-canvas-white transition-colors">
                      <span class="material-symbols-outlined text-sm">star</span>
                    </button>
                    <button type="button" @click="removeImage(idx)" title="Remove" class="p-1.5 bg-canvas-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors">
                      <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="h-px bg-border-subtle"></div>

          <!-- STEP 6: Contact Information -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold w-5 h-5 rounded-full bg-primary text-canvas-white flex items-center justify-center">6</span>
              <h3 class="text-xs uppercase tracking-wider font-semibold text-primary">Homeowner Contact Details</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-1.5">Full Name *</label>
                <input v-model="form.clientName" required type="text" placeholder="Eleanor Vance" class="w-full px-3.5 py-3 text-sm bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"/>
              </div>
              <div>
                <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-1.5">Direct Phone *</label>
                <input v-model="form.clientPhone" required type="tel" placeholder="214-000-0000" class="w-full px-3.5 py-3 text-sm bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"/>
              </div>
            </div>
            <div>
              <label class="block text-xs uppercase text-charcoal-muted font-semibold mb-1.5">Email Address *</label>
              <input v-model="form.clientEmail" required type="email" placeholder="name@residence.com" class="w-full px-3.5 py-3 text-sm bg-surface-alabaster border border-border-subtle rounded focus:outline-none focus:border-secondary"/>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <button
              :disabled="isSubmitting"
              type="submit"
              class="w-full py-4 bg-primary text-canvas-white text-xs uppercase tracking-widest hover:bg-secondary transition-all font-semibold rounded shadow-md flex items-center justify-center gap-2"
            >
              <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-base">refresh</span>
              <span>{{ isSubmitting ? 'TRANSMITTING & SAVING LISTING...' : 'TRANSMIT PROPERTY DOSSIER' }}</span>
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- Storage Limit Modal -->
    <StorageLimitModal />
  </div>
</template>
