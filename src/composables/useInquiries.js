import { ref, computed } from "vue";

const LEADS_KEY = "kyle_baugh_leads_v1";

const sampleLeads = [
  {
    id: "lead-1",
    name: "Eleanor Vance",
    email: "eleanor.vance@dallascounsel.com",
    phone: "214-555-0192",
    type: "Advisory Consultation",
    propertyAddress: "3821 Shenandoah St",
    neighborhood: "Park Cities",
    objective: "Discreet Residence Acquisition",
    message: "Interested in touring private exclusives in Highland Park with minimum 5 bedrooms and pool.",
    status: "New", // 'New', 'Contacted', 'Archived'
    createdAt: "2025-02-18T14:22:00.000Z",
  },
  {
    id: "lead-2",
    name: "Marcus Sterling",
    email: "msterling@sterlingcap.com",
    phone: "214-555-0841",
    type: "Private Showing Request",
    propertyAddress: "2007 Euclid Avenue",
    neighborhood: "Lower Greenville",
    objective: "Private Showing",
    message: "Requesting private architectural walkthrough on Saturday morning before open house.",
    status: "Contacted",
    createdAt: "2025-02-17T09:15:00.000Z",
  }
];

function loadLeads() {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(LEADS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
  } catch (e) {
    console.warn("Failed to load leads from localStorage:", e);
  }
  return sampleLeads;
}

const inquiries = ref(loadLeads());

export function useInquiries() {
  function persist() {
    localStorage.setItem(LEADS_KEY, JSON.stringify(inquiries.value));
  }

  function addInquiry(data) {
    const newLead = {
      id: "lead-" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "New",
      ...data,
    };
    inquiries.value.unshift(newLead);
    persist();
    return newLead;
  }

  function updateStatus(id, newStatus) {
    const lead = inquiries.value.find((l) => l.id === id);
    if (lead) {
      lead.status = newStatus;
      persist();
    }
  }

  function deleteInquiry(id) {
    inquiries.value = inquiries.value.filter((l) => l.id !== id);
    persist();
  }

  const unreadCount = computed(() => {
    return inquiries.value.filter((l) => l.status === "New").length;
  });

  function exportCSV() {
    if (inquiries.value.length === 0) return;

    const headers = ["ID", "Date", "Name", "Email", "Phone", "Type", "Neighborhood", "Property", "Objective", "Status", "Message"];
    const rows = inquiries.value.map((l) => [
      l.id,
      new Date(l.createdAt).toLocaleDateString(),
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.type || "").replace(/"/g, '""')}"`,
      `"${(l.neighborhood || "").replace(/"/g, '""')}"`,
      `"${(l.propertyAddress || "").replace(/"/g, '""')}"`,
      `"${(l.objective || "").replace(/"/g, '""')}"`,
      l.status,
      `"${(l.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyle-baugh-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    inquiries,
    unreadCount,
    addInquiry,
    updateStatus,
    deleteInquiry,
    exportCSV,
  };
}
