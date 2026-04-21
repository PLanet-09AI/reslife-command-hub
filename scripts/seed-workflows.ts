import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2Lh81S7KnTeyGlraLMZCjehdpf4USlMs",
  authDomain: "nsizwa-e1dca.firebaseapp.com",
  projectId: "nsizwa-e1dca",
  storageBucket: "nsizwa-e1dca.firebasestorage.app",
  messagingSenderId: "454836753706",
  appId: "1:454836753706:web:73980f2c61213b19e1fa53",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STEPS = [
  "Submission",
  "Finance Processing",
  "Requisition Approval",
  "Senior Approval",
  "Purchase Order",
  "Delivery",
  "Invoice & Payment",
];

const ASSIGNEES = [
  "Sihle Zulu",
  "Sifiso Mvubu",
  "Nonhlanhla Mbatha",
  "Phumlani Mnyango",
  "Procurement Office",
  "Logistics",
  "Finance Office",
];

type WfStatus = "completed" | "in_progress" | "delayed" | "not_started";

function makeStep(i: number, status: WfStatus, updated?: string) {
  return {
    name: STEPS[i],
    assignee: ASSIGNEES[i],
    status,
    updated: updated ?? "—",
    action: status !== "not_started" ? "Updated" : "—",
    attachments: [],
  };
}

const workflows = [
  {
    name: "Berea Hall Maintenance — Plumbing Repairs",
    residence: "Berea Hall",
    budget: "R 45,000",
    createdBy: "system",
    createdAt: Timestamp.fromDate(new Date("2026-04-10")),
    steps: [
      makeStep(0, "completed", "2026-04-10"),
      makeStep(1, "completed", "2026-04-11"),
      makeStep(2, "completed", "2026-04-12"),
      makeStep(3, "in_progress", "2026-04-15"),
      makeStep(4, "not_started"),
      makeStep(5, "not_started"),
      makeStep(6, "not_started"),
    ],
  },
  {
    name: "Ritson Residence — Electrical Upgrade",
    residence: "Ritson Residence",
    budget: "R 120,000",
    createdBy: "system",
    createdAt: Timestamp.fromDate(new Date("2026-04-08")),
    steps: [
      makeStep(0, "completed", "2026-04-08"),
      makeStep(1, "completed", "2026-04-09"),
      makeStep(2, "delayed", "2026-04-12"),
      makeStep(3, "not_started"),
      makeStep(4, "not_started"),
      makeStep(5, "not_started"),
      makeStep(6, "not_started"),
    ],
  },
  {
    name: "Ashmore Hall — Kitchen Equipment",
    residence: "Ashmore Hall",
    budget: "R 78,500",
    createdBy: "system",
    createdAt: Timestamp.fromDate(new Date("2026-04-05")),
    steps: [
      makeStep(0, "completed", "2026-04-05"),
      makeStep(1, "completed", "2026-04-06"),
      makeStep(2, "completed", "2026-04-07"),
      makeStep(3, "completed", "2026-04-08"),
      makeStep(4, "completed", "2026-04-10"),
      makeStep(5, "completed", "2026-04-14"),
      makeStep(6, "completed", "2026-04-16"),
    ],
  },
  {
    name: "Klaarwater Residence — Security Installation",
    residence: "Klaarwater Residence",
    budget: "R 95,000",
    createdBy: "system",
    createdAt: Timestamp.fromDate(new Date("2026-04-18")),
    steps: [
      makeStep(0, "completed", "2026-04-18"),
      makeStep(1, "in_progress", "2026-04-19"),
      makeStep(2, "not_started"),
      makeStep(3, "not_started"),
      makeStep(4, "not_started"),
      makeStep(5, "not_started"),
      makeStep(6, "not_started"),
    ],
  },
  {
    name: "Berea Hall — HVAC Servicing",
    residence: "Berea Hall",
    budget: "R 32,000",
    createdBy: "system",
    createdAt: Timestamp.fromDate(new Date("2026-04-20")),
    steps: [
      makeStep(0, "in_progress", "2026-04-20"),
      makeStep(1, "not_started"),
      makeStep(2, "not_started"),
      makeStep(3, "not_started"),
      makeStep(4, "not_started"),
      makeStep(5, "not_started"),
      makeStep(6, "not_started"),
    ],
  },
  {
    name: "Ritson Residence — Painting & Plastering",
    residence: "Ritson Residence",
    budget: "R 56,000",
    createdBy: "system",
    createdAt: Timestamp.fromDate(new Date("2026-04-01")),
    steps: STEPS.map((_, i) => makeStep(i, "not_started")),
  },
];

let seeded = 0;
for (const wf of workflows) {
  await addDoc(collection(db, "workflows"), wf);
  seeded++;
  console.log(`[${seeded}/${workflows.length}] Seeded: ${wf.name}`);
}

console.log(`\nDone. ${seeded} workflows added to Firestore.`);
process.exit(0);
