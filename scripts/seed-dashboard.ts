import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedCollection(name: string, items: { id: string; [key: string]: unknown }[]) {
  const batch = writeBatch(db);
  for (const item of items) {
    const { id, ...data } = item;
    batch.set(doc(collection(db, name), id), data);
  }
  await batch.commit();
  console.log(`  ✓ ${name} (${items.length} docs)`);
}

async function main() {
  console.log("Seeding Firestore dashboard collections…\n");

  await seedCollection("statCards", [
    { id: "s1", label: "Total Capex Budget", value: "R 6,644,289", delta: "+12.4%", tone: "primary", order: 1 },
    { id: "s2", label: "Active Projects",    value: "23",           delta: "+3",           tone: "info",    order: 2 },
    { id: "s3", label: "Completed Projects", value: "11",           delta: "+2 this month",tone: "success", order: 3 },
    { id: "s4", label: "Pending Approvals",  value: "7",            delta: "2 urgent",     tone: "warning", order: 4 },
  ]);

  await seedCollection("budgetByResidence", [
    { id: "br1", residence: "Steve Biko",     budget: 1450000, actual: 1280000 },
    { id: "br2", residence: "Campbell",       budget: 1200000, actual: 1110000 },
    { id: "br3", residence: "Corlo Court",    budget: 980000,  actual: 720000  },
    { id: "br4", residence: "Winterton",      budget: 1100000, actual: 980000  },
    { id: "br5", residence: "Student Village",budget: 1300000, actual: 1180000 },
    { id: "br6", residence: "Stratford",      budget: 614289,  actual: 480000  },
  ]);

  await seedCollection("spendTrend", [
    { id: "st1", month: "Jan", order: 1, spend: 320000 },
    { id: "st2", month: "Feb", order: 2, spend: 410000 },
    { id: "st3", month: "Mar", order: 3, spend: 520000 },
    { id: "st4", month: "Apr", order: 4, spend: 480000 },
    { id: "st5", month: "May", order: 5, spend: 610000 },
    { id: "st6", month: "Jun", order: 6, spend: 720000 },
    { id: "st7", month: "Jul", order: 7, spend: 680000 },
    { id: "st8", month: "Aug", order: 8, spend: 590000 },
    { id: "st9", month: "Sep", order: 9, spend: 530000 },
  ]);

  await seedCollection("categorySpend", [
    { id: "cs1", name: "Furniture",    value: 1820000 },
    { id: "cs2", name: "Equipment",    value: 3960000 },
    { id: "cs3", name: "Computers",    value: 410000  },
    { id: "cs4", name: "Maintenance",  value: 454289  },
  ]);

  await seedCollection("activity", [
    { id: "a1", user: "Alvin Smith",        action: "Approved",    target: "Steve Biko Procurement Plan 2025.pdf", time: "2 min ago",  timestamp: Date.now() - 2 * 60 * 1000 },
    { id: "a2", user: "Sihle Zulu",         action: "Uploaded",    target: "Beds Replacement Schedule.xlsx",       time: "1 hour ago", timestamp: Date.now() - 60 * 60 * 1000 },
    { id: "a3", user: "Phumlani Mnyango",   action: "Commented on",target: "Heat Pumps Strategy.docx",             time: "3 hours ago",timestamp: Date.now() - 3 * 60 * 60 * 1000 },
    { id: "a4", user: "Sifiso Mvubu",       action: "Edited",      target: "Capex Detailed Report 2025.xlsx",      time: "5 hours ago",timestamp: Date.now() - 5 * 60 * 60 * 1000 },
    { id: "a5", user: "Nonhlanhla Mbatha",  action: "Submitted",   target: "Q3 Budget Variance.xlsx",              time: "Yesterday",  timestamp: Date.now() - 24 * 60 * 60 * 1000 },
    { id: "a6", user: "Indira Sing",        action: "Viewed",      target: "Laundry Maintenance SLA.pdf",          time: "Yesterday",  timestamp: Date.now() - 25 * 60 * 60 * 1000 },
  ]);

  await seedCollection("documents", [
    { id: "d1", name: "Steve Biko Procurement Plan 2025.pdf", residence: "Steve Biko",    type: "Procurement Plan", status: "Approved",     owner: "Sihle Zulu",          updated: "2 hours ago", size: "2.4 MB" },
    { id: "d2", name: "Heat Pumps Strategy.docx",             residence: "Campbell",      type: "Heat Pumps",       status: "Pending",      owner: "Nonhlanhla Mbatha",   updated: "5 hours ago", size: "1.1 MB" },
    { id: "d3", name: "Capex Detailed Report 2025.xlsx",      residence: "All",           type: "Capex",            status: "Under Review", owner: "Sifiso Mvubu",        updated: "Yesterday",   size: "840 KB" },
    { id: "d4", name: "Laundry Maintenance SLA.pdf",          residence: "Winterton",     type: "Laundry",          status: "Approved",     owner: "Sihle Zulu",          updated: "2 days ago",  size: "1.8 MB" },
    { id: "d5", name: "Beds Replacement Schedule.xlsx",       residence: "Student Village",type: "Beds",            status: "Pending",      owner: "Sihle Zulu",          updated: "3 days ago",  size: "320 KB" },
    { id: "d6", name: "Garden Refurbishment Quote.pdf",       residence: "Stratford",     type: "Gardens",          status: "Rejected",     owner: "Phumlani Mnyango",    updated: "4 days ago",  size: "920 KB" },
  ]);

  await seedCollection("capexLineItems", [
    { id: "c1",  item: "3-Seater Couches",        category: "Furniture",    qty: 24,  unit: 8500,  residence: "Steve Biko",     type: "Replacement" },
    { id: "c2",  item: "Single Mattresses",        category: "Furniture",    qty: 180, unit: 2200,  residence: "Student Village",type: "Replacement" },
    { id: "c3",  item: "Single Beds",              category: "Furniture",    qty: 120, unit: 3400,  residence: "Campbell",       type: "New"         },
    { id: "c4",  item: "Bar Fridges (90L)",         category: "Equipment",    qty: 60,  unit: 4200,  residence: "Winterton",      type: "Replacement" },
    { id: "c5",  item: "Double-Door Fridges (300L)",category: "Equipment",    qty: 12,  unit: 12500, residence: "Stratford",      type: "New"         },
    { id: "c6",  item: "Microwaves",               category: "Equipment",    qty: 80,  unit: 1800,  residence: "Corlo Court",    type: "Replacement" },
    { id: "c7",  item: "Washing Machines (10kg)",  category: "Equipment",    qty: 14,  unit: 18500, residence: "Steve Biko",     type: "New"         },
    { id: "c8",  item: "Tumble Dryers (10kg)",     category: "Equipment",    qty: 14,  unit: 17200, residence: "Steve Biko",     type: "New"         },
    { id: "c9",  item: "Air Conditioners",         category: "Equipment",    qty: 22,  unit: 14200, residence: "Campbell",       type: "New"         },
    { id: "c10", item: "Stove Ovens",              category: "Equipment",    qty: 18,  unit: 9800,  residence: "Student Village",type: "Replacement" },
    { id: "c11", item: "Desktop Computers",        category: "Computers",    qty: 30,  unit: 13500, residence: "All",            type: "New"         },
  ]);

  await seedCollection("floors", [
    { id: "f1", residence: "Steve Biko", floor: "Ground Floor", rooms: 24, occupied: 21, vacant: 2, maintenance: 1 },
    { id: "f2", residence: "Steve Biko", floor: "1st Floor",    rooms: 28, occupied: 25, vacant: 1, maintenance: 2 },
    { id: "f3", residence: "Campbell",   floor: "Ground Floor", rooms: 20, occupied: 18, vacant: 2, maintenance: 0 },
    { id: "f4", residence: "Campbell",   floor: "1st Floor",    rooms: 22, occupied: 20, vacant: 1, maintenance: 1 },
  ]);

  console.log("\nAll collections seeded.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
