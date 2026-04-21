import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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
const auth = getAuth(app);
const db = getFirestore(app);

const DEFAULT_PASSWORD = "DUT@2025!";

const TEAM = [
  { name: "Alvin Smith",       email: "alvin.smith@dut.ac.za",   role: "Admin",          residence: "—",           initials: "AS", active: true },
  { name: "Phumlani Mnyango",  email: "phumlanim@dut.ac.za",     role: "Manager",        residence: "All",         initials: "PM", active: true },
  { name: "Sihle Zulu",        email: "sihlez@dut.ac.za",        role: "Coordinator",    residence: "Steve Biko",  initials: "SZ", active: true },
  { name: "Nonhlanhla Mbatha", email: "nonhlanhlam@dut.ac.za",   role: "Budget Officer", residence: "All",         initials: "NM", active: true },
  { name: "Sifiso Mvubu",      email: "sifisom@dut.ac.za",       role: "Finance Officer",residence: "All",         initials: "SM", active: true },
  { name: "Indira Sing",       email: "indiras@dut.ac.za",       role: "Senior Admin",   residence: "All",         initials: "IS", active: true },
];

async function seed() {
  console.log(`Seeding team members with Auth accounts (password: ${DEFAULT_PASSWORD})\n`);
  for (const member of TEAM) {
    try {
      // Try to create — if already exists, sign in to get UID
      let uid: string;
      try {
        const cred = await createUserWithEmailAndPassword(auth, member.email, DEFAULT_PASSWORD);
        uid = cred.user.uid;
        console.log(`  + Created auth: ${member.email}`);
      } catch (e: unknown) {
        if ((e as { code?: string }).code === "auth/email-already-in-use") {
          const cred = await signInWithEmailAndPassword(auth, member.email, DEFAULT_PASSWORD);
          uid = cred.user.uid;
          console.log(`  ~ Existing auth: ${member.email}`);
        } else {
          throw e;
        }
      }
      await setDoc(doc(db, "teamMembers", uid), {
        name: member.name,
        email: member.email,
        role: member.role,
        residence: member.residence,
        initials: member.initials,
        active: member.active,
      });
      console.log(`  ✓ Firestore profile written: ${member.name}`);
    } catch (err) {
      console.error(`  ✗ Failed for ${member.email}:`, err);
    }
  }
  console.log("\nDone. Default password for all members: " + DEFAULT_PASSWORD);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
