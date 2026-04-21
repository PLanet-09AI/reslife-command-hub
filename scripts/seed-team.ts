import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

const TEAM = [
  { id: "u1", name: "Alvin Smith",       email: "alvin.smith@dut.ac.za",   role: "Admin",          residence: "—",           initials: "AS", active: true },
  { id: "u2", name: "Phumlani Mnyango",  email: "phumlanim@dut.ac.za",     role: "Manager",        residence: "All",         initials: "PM", active: true },
  { id: "u3", name: "Sihle Zulu",        email: "sihlez@dut.ac.za",        role: "Coordinator",    residence: "Steve Biko",  initials: "SZ", active: true },
  { id: "u4", name: "Nonhlanhla Mbatha", email: "nonhlanhlam@dut.ac.za",   role: "Budget Officer", residence: "All",         initials: "NM", active: true },
  { id: "u5", name: "Sifiso Mvubu",      email: "sifisom@dut.ac.za",       role: "Finance Officer",residence: "All",         initials: "SM", active: true },
  { id: "u6", name: "Indira Sing",       email: "indiras@dut.ac.za",       role: "Senior Admin",   residence: "All",         initials: "IS", active: true },
];

async function seed() {
  console.log("Seeding teamMembers collection…");
  for (const member of TEAM) {
    const { id, ...data } = member;
    await setDoc(doc(db, "teamMembers", id), data);
    console.log(`  ✓ ${data.name}`);
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
