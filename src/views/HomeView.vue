<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useProperties } from "../composables/useProperties";
import { useSiteSettings } from "../composables/useSiteSettings";
import { useInquiries } from "../composables/useInquiries";
import EditorialLayout from "../components/designs/EditorialLayout.vue";

const router = useRouter();
const { properties } = useProperties();
const { siteSettings } = useSiteSettings();
const { addInquiry } = useInquiries();

const emit = defineEmits(["toast"]);

const activeCategory = ref("all");
const searchQuery = ref("");
const maxPrice = ref(0);

const categories = [
  { id: "all", label: "All Residences" },
  { id: "active", label: "Active Exclusives" },
  { id: "sold", label: "Closed Track Record" },
  { id: "park-cities", label: "Park Cities" },
  { id: "lakewood", label: "Lakewood & East Dallas" },
  { id: "midway-hollow", label: "Midway Hollow" },
  { id: "historic", label: "Historic Landmarks" },
];

const filteredProperties = computed(() => {
  return properties.value.filter((p) => {
    if (activeCategory.value === "active") {
      if (!p.status?.includes("Active")) return false;
    } else if (activeCategory.value === "sold") {
      if (!p.status?.includes("Sold") && !p.status?.includes("Leased")) return false;
    } else if (activeCategory.value === "park-cities") {
      if (p.enclaveCategory !== "park-cities" && !p.neighborhood?.includes("Park Cities") && !p.neighborhood?.includes("Preston Hollow")) return false;
    } else if (activeCategory.value === "lakewood") {
      if (p.enclaveCategory !== "lakewood" && !p.neighborhood?.includes("Lakewood") && !p.neighborhood?.includes("Greenville") && !p.neighborhood?.includes("East Dallas")) return false;
    } else if (activeCategory.value === "midway-hollow") {
      if (p.enclaveCategory !== "midway-hollow" && !p.neighborhood?.includes("Midway")) return false;
    } else if (activeCategory.value === "historic") {
      if (p.enclaveCategory !== "historic" && !p.status?.includes("Historic") && p.yearBuilt > 1940) return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const match = p.title?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q) || p.neighborhood?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (maxPrice.value > 0 && p.price > maxPrice.value) return false;
    return true;
  });
});

const consultForm = ref({
  fullName: "",
  email: "",
  phone: "",
  neighborhood: "park-cities",
  objective: "acquisition",
  message: "",
});
const isSubmittingConsult = ref(false);

function handleConsultSubmit() {
  isSubmittingConsult.value = true;
  setTimeout(() => {
    addInquiry({
      name: consultForm.value.fullName,
      email: consultForm.value.email,
      phone: consultForm.value.phone,
      type: "Private Advisory Inquiry",
      neighborhood: consultForm.value.neighborhood,
      objective: consultForm.value.objective,
      message: consultForm.value.message || "Consultation requested from homepage.",
    });
    emit("toast", "Your confidential inquiry has been submitted to " + siteSettings.value.advisorName + ".", "success");
    consultForm.value = { fullName: "", email: "", phone: "", neighborhood: "park-cities", objective: "acquisition", message: "" };
    isSubmittingConsult.value = false;
  }, 400);
}
</script>

<template>
  <EditorialLayout
    :site-settings="siteSettings"
    :filtered-properties="filteredProperties"
    :categories="categories"
    :active-category="activeCategory"
    :search-query="searchQuery"
    :max-price="maxPrice"
    :consult-form="consultForm"
    :is-submitting-consult="isSubmittingConsult"
    @update:active-category="activeCategory = $event"
    @update:search-query="searchQuery = $event"
    @update:max-price="maxPrice = $event"
    @submit-consult="handleConsultSubmit"
  />
</template>
