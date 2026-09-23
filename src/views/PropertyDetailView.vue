<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProperties } from "../composables/useProperties";
import { useSiteSettings } from "../composables/useSiteSettings";
import ImageLightbox from "../components/ImageLightbox.vue";
import BookingModal from "../components/BookingModal.vue";

const route = useRoute();
const router = useRouter();
const { getPropertyById } = useProperties();
const { siteSettings } = useSiteSettings();

const emit = defineEmits(["toast"]);

const property = computed(() => {
  return getPropertyById(route.params.id) || null;
});

// Lightbox
const isLightboxOpen = ref(false);
const initialPhotoIndex = ref(0);

const galleryImages = computed(() => {
  if (!property.value) return [];
  if (property.value.gallery && property.value.gallery.length > 0) {
    return property.value.gallery;
  }
  if (property.value.heroImage) {
    return [{ url: property.value.heroImage, title: property.value.title }];
  }
  return [];
});

function openLightbox(index = 0) {
  initialPhotoIndex.value = index;
  isLightboxOpen.value = true;
}

// Booking Modal
const isBookingOpen = ref(false);

function openBooking() {
  isBookingOpen.value = true;
}

function handleBooked(payload) {
  emit("toast", `Showing confirmed for ${payload.name}. ${siteSettings.value.advisorName} will follow up shortly.`, "success");
}

function shareListing() {
  navigator.clipboard.writeText(window.location.href);
  emit("toast", "Listing link copied to clipboard.", "info");
}

function printDossier() {
  window.print();
}
</script>

<template>
  <div v-if="property" class="pb-24">
    <!-- Breadcrumb & Header Meta -->
    <section class="max-w-7xl mx-auto px-5 lg:px-12 pt-6 pb-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <nav class="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal-muted">
          <router-link to="/" class="hover:text-primary transition-colors">Dallas Portfolio</router-link>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="hover:text-primary">{{ property.neighborhood }}</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="text-primary font-semibold truncate">{{ property.title }}</span>
        </nav>
        <div class="flex items-center gap-3">
          <span
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs uppercase tracking-wider font-semibold',
              property.status === 'Active Exclusive' ? 'bg-[#E9EFEA] text-status-active' :
              property.status === 'Private Exclusive' ? 'bg-primary text-canvas-white' :
              'bg-surface-linen text-secondary border border-border-brass'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-status-active animate-pulse"></span>
            {{ property.status }}
          </span>
          <span
            v-if="property.openHouse"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-surface-linen text-secondary text-xs uppercase tracking-wider border border-border-brass font-semibold"
          >
            <span class="material-symbols-outlined text-[14px]">calendar_today</span>
            {{ property.openHouse }}
          </span>
          <a
            v-if="property.originalCompassUrl"
            :href="property.originalCompassUrl"
            target="_blank"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-surface-linen text-primary text-xs uppercase tracking-wider border border-border-brass font-semibold hover:bg-surface-alabaster transition-colors"
            title="View Official Compass Listing Dossier"
          >
            <span class="material-symbols-outlined text-[14px] text-secondary">verified</span>
            <span>Compass Listing</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Architectural Photo Mosaic -->
    <section class="max-w-7xl mx-auto px-5 lg:px-12 pb-8">
      <div class="grid grid-cols-12 gap-3 lg:gap-4 h-auto md:h-[540px]">
        <!-- Hero Exterior (Left) -->
        <div
          @click="openLightbox(0)"
          class="col-span-12 md:col-span-7 relative group overflow-hidden rounded bg-surface-container h-[340px] md:h-full cursor-pointer shadow-sm"
        >
          <img
            :src="property.heroImage || galleryImages[0]?.url"
            :alt="property.title"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
          <div class="absolute bottom-6 left-6 text-canvas-white">
            <span class="inline-block px-2.5 py-1 bg-primary/80 backdrop-blur-md rounded text-[10px] uppercase tracking-widest text-canvas-white mb-2 font-semibold">
              Architectural Facade · {{ property.yearBuilt }}
            </span>
            <h2 class="font-headline text-2xl text-canvas-white font-normal">{{ property.title }}</h2>
          </div>
        </div>

        <!-- 2x2 Grid (Right) -->
        <div class="col-span-12 md:col-span-5 grid grid-cols-2 gap-3 lg:gap-4 h-[300px] md:h-full">
          <div
            v-for="(img, idx) in galleryImages.slice(1, 5)"
            :key="idx"
            @click="openLightbox(idx + 1)"
            class="relative group overflow-hidden rounded bg-surface-container cursor-pointer shadow-sm"
          >
            <img
              :src="img.url || img"
              :alt="img.title || 'Interior photo'"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
            <span
              v-if="img.title"
              class="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-canvas-white/90 backdrop-blur-sm rounded text-[9px] uppercase tracking-wider text-charcoal-body font-semibold"
            >
              {{ img.title }}
            </span>
          </div>

          <!-- Fallback photo box with view photos trigger if less than 4 gallery images -->
          <div
            v-if="galleryImages.length <= 1"
            @click="openLightbox(0)"
            class="col-span-2 relative group overflow-hidden rounded bg-surface-linen flex flex-col items-center justify-center p-4 text-center cursor-pointer border border-border-subtle"
          >
            <span class="material-symbols-outlined text-3xl text-secondary mb-1">photo_library</span>
            <span class="text-xs uppercase tracking-wider font-semibold text-primary">View Full Photographic Dossier</span>
          </div>
        </div>
      </div>
    </section>
    <!-- Offering Price Bar -->
    <section class="max-w-7xl mx-auto px-5 lg:px-12 pb-10">
      <div class="bg-canvas-white border border-border-subtle p-6 lg:p-8 rounded shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border-subtle">
          <div>
            <span class="text-xs uppercase tracking-widest text-secondary font-semibold">{{ property.neighborhood }}</span>
            <h1 class="font-headline text-2xl sm:text-3xl text-primary tracking-tight mt-1">{{ property.address }}</h1>
            <p class="text-xs text-charcoal-muted mt-1">{{ property.tagline }}</p>
          </div>
          <div class="flex flex-col lg:items-end">
            <span class="text-xs uppercase tracking-widest text-charcoal-muted font-semibold">Offering Price</span>
            <span class="font-headline text-3xl sm:text-4xl text-primary font-medium tracking-tight">{{ property.priceFormatted }}</span>
            <span class="text-xs uppercase tracking-widest text-secondary font-semibold mt-0.5">${{ property.pricePerSqft }} / SQ FT</span>
          </div>
        </div>

        <!-- Specs Grid & Action Utilities -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4 pt-6 items-center">
          <div class="border-r border-border-subtle pr-3">
            <span class="text-xs uppercase text-charcoal-muted font-semibold block">Bedrooms</span>
            <span class="font-headline text-xl text-primary font-medium">{{ property.bedrooms }} Beds</span>
          </div>
          <div class="border-r border-border-subtle pr-3">
            <span class="text-xs uppercase text-charcoal-muted font-semibold block">Bathrooms</span>
            <span class="font-headline text-xl text-primary font-medium">{{ property.bathrooms }} Baths</span>
          </div>
          <div class="border-r border-border-subtle pr-3">
            <span class="text-xs uppercase text-charcoal-muted font-semibold block">Conditioned Area</span>
            <span class="font-headline text-xl text-primary font-medium">{{ property.sqft?.toLocaleString() }} Sq Ft</span>
          </div>
          <div class="border-r border-border-subtle pr-3">
            <span class="text-xs uppercase text-charcoal-muted font-semibold block">Parcel Size</span>
            <span class="font-headline text-xl text-primary font-medium">{{ property.lotSize }}</span>
          </div>
          <div class="border-r border-border-subtle pr-3">
            <span class="text-xs uppercase text-charcoal-muted font-semibold block">Garage</span>
            <span class="font-headline text-xl text-primary font-medium">{{ property.garage }}</span>
          </div>
          <div class="flex items-center gap-2 justify-start md:justify-end">
            <button @click="shareListing" class="p-2.5 rounded border border-border-subtle text-charcoal-body hover:bg-surface-linen hover:border-border-brass transition-all" title="Share Listing">
              <span class="material-symbols-outlined text-lg">share</span>
            </button>
            <button @click="printDossier" class="p-2.5 rounded border border-border-subtle text-charcoal-body hover:bg-surface-linen hover:border-border-brass transition-all" title="Print Dossier Brochure">
              <span class="material-symbols-outlined text-lg">print</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Two-Column Editorial & Technical Canvas -->
    <main class="max-w-7xl mx-auto px-5 lg:px-12">
      <div class="grid grid-cols-12 gap-8 lg:gap-12">
        <!-- LEFT COLUMN: Narrative & Forensics -->
        <div class="col-span-12 lg:col-span-8 space-y-8">
          <!-- Architectural Narrative -->
          <article class="bg-canvas-white p-8 lg:p-10 border border-border-subtle rounded shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <span class="h-px w-8 bg-secondary"></span>
              <span class="text-xs uppercase tracking-widest text-secondary font-semibold">Architectural Narrative</span>
            </div>
            <h2 class="font-headline text-2xl text-primary mb-6">Restored Historic Soul with Contemporary Core Engineering</h2>
            <div class="space-y-4 text-sm sm:text-base text-charcoal-body leading-relaxed font-light whitespace-pre-line">
              {{ property.description }}
            </div>
          </article>

          <!-- Structural Forensics -->
          <div v-if="property.forensics && property.forensics.length > 0" class="bg-canvas-white p-8 lg:p-10 border border-border-subtle rounded shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <span class="h-px w-8 bg-secondary"></span>
              <span class="text-xs uppercase tracking-widest text-secondary font-semibold">Construction Due Diligence</span>
            </div>
            <h2 class="font-headline text-2xl text-primary mb-6">Structural & Mechanical Forensics Audit</h2>
            <div class="divide-y divide-border-subtle border-t border-b border-border-subtle">
              <div
                v-for="(audit, idx) in property.forensics"
                :key="idx"
                class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <span class="text-xs uppercase tracking-wider font-semibold text-primary sm:w-1/3">{{ audit.label }}</span>
                <span class="text-xs text-charcoal-muted sm:w-2/3 leading-relaxed">{{ audit.value }}</span>
              </div>
            </div>
          </div>

          <!-- Key Highlights -->
          <div v-if="property.highlights && property.highlights.length > 0" class="bg-canvas-white p-8 lg:p-10 border border-border-subtle rounded shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <span class="h-px w-8 bg-secondary"></span>
              <span class="text-xs uppercase tracking-widest text-secondary font-semibold">Signature Features</span>
            </div>
            <h2 class="font-headline text-2xl text-primary mb-6">Distinguished Residence Highlights</h2>
            <ul class="space-y-3">
              <li
                v-for="(h, idx) in property.highlights"
                :key="idx"
                class="flex items-start gap-3 text-xs sm:text-sm text-charcoal-body"
              >
                <span class="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">check_circle</span>
                <span>{{ h }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- RIGHT COLUMN: Advisor & Appointment -->
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <!-- Showing Appointment Card -->
          <div class="bg-primary text-canvas-white p-6 sm:p-8 rounded shadow-xl border border-secondary">
            <span class="text-xs uppercase tracking-widest text-border-brass font-semibold block mb-2">Exclusive Access</span>
            <h3 class="font-headline text-2xl text-canvas-white mb-2">Book a Private Showing</h3>
            <p class="text-xs text-on-primary-container leading-relaxed mb-6">
              Tour this residence privately with advisor {{ siteSettings.advisorName }}. Receive an unredacted structural dossier and recent closed comps appraisal.
            </p>
            <button
              @click="openBooking"
              class="w-full py-3.5 bg-secondary text-canvas-white hover:bg-white hover:text-primary transition-all text-xs uppercase tracking-widest font-semibold rounded shadow"
            >
              Request Appointment
            </button>
            <div class="mt-4 pt-4 border-t border-charcoal-muted/30 flex items-center justify-between text-xs text-border-brass">
              <span>Direct Concierge:</span>
              <a :href="'tel:' + siteSettings.phoneTel" class="font-semibold underline">{{ siteSettings.phone }}</a>
            </div>
          </div>

          <!-- Advisor Card -->
          <div class="bg-canvas-white p-6 border border-border-subtle rounded shadow-sm">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 rounded-full overflow-hidden border border-border-brass shrink-0">
                <img
                  class="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAjYRx4css-T_-AENSBByIhtA1ar3h-k_YDrBx-q0I0TROujIGFVGNdJKUMkSWuarmqws42eeIs-XykO0t437gE720__boPCHG8giZD33unv4UuBcsiW5KTG-BKuAIjImAtBhkMhyRXohPFlTl_pYO5b_-iDsMjBqxvxuuymG-554tWTz9Isj4zRIMXmO6LoymP7wYyS6twqo0lzZEJjdOYmrolz-yjc0kZEd6cB_YvSBShcLeEG3Kzg"
                  :alt="siteSettings.advisorName"
                />
              </div>
              <div>
                <h4 class="font-headline text-xl text-primary font-semibold">{{ siteSettings.advisorName }}</h4>
                <p class="text-[10px] uppercase tracking-widest text-secondary font-semibold">Founder & Broker</p>
                <p class="text-xs text-charcoal-muted mt-0.5">B.S. Construction Science</p>
              </div>
            </div>
            <p class="text-xs text-charcoal-muted leading-relaxed border-t border-border-subtle pt-4">
              Providing discrete luxury real estate advisory with 13+ years of construction forensics throughout Park Cities, Preston Hollow, and Lakewood.
            </p>
            <div class="mt-4 pt-4 border-t border-border-subtle flex flex-col gap-2">
              <a :href="'tel:' + siteSettings.phoneTel" class="flex items-center gap-2 text-xs text-primary hover:text-secondary font-semibold">
                <span class="material-symbols-outlined text-sm text-secondary">phone</span>
                {{ siteSettings.phone }}
              </a>
              <a :href="'mailto:' + siteSettings.email" class="flex items-center gap-2 text-xs text-primary hover:text-secondary">
                <span class="material-symbols-outlined text-sm text-secondary">email</span>
                {{ siteSettings.email }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <ImageLightbox
      :isOpen="isLightboxOpen"
      :images="galleryImages"
      :initialIndex="initialPhotoIndex"
      @close="isLightboxOpen = false"
    />

    <BookingModal
      :isOpen="isBookingOpen"
      :property="property"
      @close="isBookingOpen = false"
      @booked="handleBooked"
    />
  </div>

  <div v-else class="text-center py-28 bg-surface-alabaster">
    <h2 class="font-headline text-3xl text-primary mb-2">Residence Not Found</h2>
    <p class="text-xs text-charcoal-muted mb-6">The requested listing dossier could not be located in your portfolio.</p>
    <router-link to="/" class="px-6 py-3 bg-primary text-canvas-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-secondary transition-colors">
      Return to Active Portfolio
    </router-link>
  </div>
</template>
