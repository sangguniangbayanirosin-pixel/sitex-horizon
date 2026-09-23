// Sitex Horizon – Mock Data

const routes = [
  { id: 1, name: "Gubat", via: "Coastal Road", eta: 4, status: "on-time" },
  { id: 2, name: "Irosin", via: "Maharlika Hwy", eta: 9, status: "on-time" },
  { id: 3, name: "Bulan", via: "Donsol Rd", eta: 14, status: "delayed" },
  { id: 4, name: "Maatnog", via: "Bulusan Junction", eta: 18, status: "on-time" },
  { id: 5, name: "Legazpi", via: "Maharlika Hwy", eta: 45, status: "on-time" },
  { id: 6, name: "Pilar", via: "Coastal", eta: 22, status: "delayed" }
];

const announcements = {
  critical: {
    title: "⚠️ NO TRAVEL TODAY",
    body: "Due to Typhoon Signal & LGU Ordinance. All trips are suspended until further notice.",
    safety: "INGAT PO ANG LAHAT",
    hotlines: true
  },
  caution: {
    title: "⚠️ LIMITED SERVICE",
    body: "Due to bad weather, only 2–5 buses are operating today on selected routes. Please check live arrivals below.",
    safety: "INGAT PO ANG LAHAT",
    hotlines: false
  },
  info: {
    title: "ℹ️ SERVICE UPDATE",
    body: "Normal operations have resumed. Thank you for your patience and understanding.",
    safety: "INGAT PO ANG LAHAT",
    hotlines: false
  },
  none: null
};

// Current active announcement (can be changed from admin)
let currentAnnouncement = "critical";
