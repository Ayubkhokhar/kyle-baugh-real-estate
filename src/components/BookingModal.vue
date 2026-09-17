<script setup>
import { ref } from "vue";
import { useInquiries } from "../composables/useInquiries";

const props = defineProps({
  isOpen: Boolean,
  property: Object,
});

const emit = defineEmits(["close", "booked"]);

const { addInquiry } = useInquiries();

const formData = ref({
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "Afternoon (1:00 PM - 3:00 PM)",
  message: "",
});

const isSubmitting = ref(false);

function handleSubmit() {
  isSubmitting.value = true;
  setTimeout(() => {
    addInquiry({
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      type: "Private Showing Request",
      propertyAddress: props.property ? props.property.address : "Dallas Exclusive",
      neighborhood: props.property ? props.property.neighborhood : "Dallas",
      objective: `Private Showing on ${formData.value.date || "Requested Date"} (${formData.value.time})`,
      message: formData.value.message || "Requested private architectural walkthrough.",
    });

    isSubmitting.value = false;
    emit("booked", {
      name: formData.value.name,
      property: props.property?.title,
    });
    emit("close");

    // Reset
    formData.value = {
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "Afternoon (1:00 PM - 3:00 PM)",
      message: "",
    };
  }, 400);
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
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-primary/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div
        class="bg-canvas-white border border-border-brass max-w-xl w-full rounded-lg shadow-2xl p-6 sm:p-8 relative"
      >
        <button
          @click="emit('close')"
          class="absolute top-5 right-5 text-charcoal-muted hover:text-primary transition-colors p-1"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>

        <div class="mb-4">
          <span class="text-xs uppercase tracking-widest text-secondary font-semibold block mb-1">
            Exclusive Appointment
          </span>
          <h2 class="font-headline text-2xl sm:text-3xl text-primary">
            Book Private Showing
          </h2>
          <p v-if="property" class="text-xs text-charcoal-muted uppercase tracking-wider mt-1">
            {{ property.address }} · {{ property.priceFormatted }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase tracking-wider text-charcoal-muted font-semibold mb-1.5">
                Full Name *
              </label>
              <input
                v-model="formData.name"
                required
                type="text"
                placeholder="Eleanor Vance"
                class="w-full px-3.5 py-2.5 bg-surface-alabaster border border-border-subtle rounded text-sm text-primary focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-charcoal-muted font-semibold mb-1.5">
                Direct Phone *
              </label>
              <input
                v-model="formData.phone"
                required
                type="tel"
                placeholder="214-555-0192"
                class="w-full px-3.5 py-2.5 bg-surface-alabaster border border-border-subtle rounded text-sm text-primary focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-charcoal-muted font-semibold mb-1.5">
              Email Address *
            </label>
            <input
              v-model="formData.email"
              required
              type="email"
              placeholder="eleanor@residence.com"
              class="w-full px-3.5 py-2.5 bg-surface-alabaster border border-border-subtle rounded text-sm text-primary focus:outline-none focus:border-secondary"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs uppercase tracking-wider text-charcoal-muted font-semibold mb-1.5">
                Preferred Date *
              </label>
              <input
                v-model="formData.date"
                required
                type="date"
                class="w-full px-3.5 py-2.5 bg-surface-alabaster border border-border-subtle rounded text-sm text-primary focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label class="block text-xs uppercase tracking-wider text-charcoal-muted font-semibold mb-1.5">
                Time Window *
              </label>
              <select
                v-model="formData.time"
                class="w-full px-3.5 py-2.5 bg-surface-alabaster border border-border-subtle rounded text-sm text-primary focus:outline-none focus:border-secondary"
              >
                <option>Morning (10:00 AM - 12:00 PM)</option>
                <option>Afternoon (1:00 PM - 3:00 PM)</option>
                <option>Late Afternoon (3:30 PM - 5:30 PM)</option>
                <option>Twilight Viewing (6:00 PM - 7:30 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-wider text-charcoal-muted font-semibold mb-1.5">
              Specific Architectural Notes or Criteria (Optional)
            </label>
            <textarea
              v-model="formData.message"
              rows="3"
              placeholder="E.g. Requesting crawlspace structural inspection review or client representative attendance..."
              class="w-full px-3.5 py-2 bg-surface-alabaster border border-border-subtle rounded text-sm text-primary focus:outline-none focus:border-secondary"
            ></textarea>
          </div>

          <div class="pt-2">
            <button
              :disabled="isSubmitting"
              type="submit"
              class="w-full py-3.5 bg-primary text-canvas-white hover:bg-secondary text-xs uppercase tracking-widest font-semibold transition-colors duration-200 border border-primary flex items-center justify-center gap-2"
            >
              <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-base">refresh</span>
              <span>{{ isSubmitting ? 'CONFIRMING SHOWING...' : 'CONFIRM SHOWING RESERVATION' }}</span>
            </button>
          </div>

          <p class="text-[11px] text-charcoal-muted text-center leading-relaxed">
            Discreet confirmation transmitted directly to Kyle Baugh. A private concierge calendar invitation will be dispatched within 2 hours.
          </p>
        </form>
      </div>
    </div>
  </Transition>
</template>
