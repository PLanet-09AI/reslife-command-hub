import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Types ──────────────────────────────────────────────────────────────────

export interface StatCard {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "info" | "success" | "warning";
}

export interface BudgetByResidence {
  id: string;
  residence: string;
  budget: number;
  actual: number;
}

export interface SpendTrend {
  id: string;
  month: string;
  order: number;
  spend: number;
}

export interface CategorySpend {
  id: string;
  name: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  timestamp: number;
}

export interface PendingDocument {
  id: string;
  name: string;
  residence: string;
  type: string;
  status: string;
  owner: string;
  updated: string;
  size: string;
}

export interface CapexLineItem {
  id: string;
  item: string;
  category: string;
  qty: number;
  unit: number;
  residence: string;
  type: string;
}

export interface Floor {
  id: string;
  residence: string;
  floor: string;
  rooms: number;
  occupied: number;
  vacant: number;
  maintenance: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function useCollection<T>(collectionName: string, q?: ReturnType<typeof query>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = q ?? collection(db, collectionName);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading };
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useStatCards() {
  const { data, loading } = useCollection<StatCard>("statCards");
  return { statCards: data, loading };
}

export function useBudgetByResidence() {
  const { data, loading } = useCollection<BudgetByResidence>("budgetByResidence");
  return { budgetByResidence: data, loading };
}

export function useSpendTrend() {
  const q = query(collection(db, "spendTrend"), orderBy("order", "asc"));
  const { data, loading } = useCollection<SpendTrend>("spendTrend", q);
  return { spendTrend: data, loading };
}

export function useCategorySpend() {
  const { data, loading } = useCollection<CategorySpend>("categorySpend");
  return { categorySpend: data, loading };
}

export function useRecentActivity() {
  const q = query(collection(db, "activity"), orderBy("timestamp", "desc"), limit(5));
  const { data, loading } = useCollection<ActivityItem>("activity", q);
  return { activity: data, loading };
}

export function usePendingDocuments() {
  const { data, loading } = useCollection<PendingDocument>("documents");
  const pending = data.filter((d) => d.status === "Pending" || d.status === "Under Review");
  return { pendingDocuments: pending, allDocuments: data, loading };
}

export function useCapexLineItems() {
  const { data, loading } = useCollection<CapexLineItem>("capexLineItems");
  return { capexLineItems: data, loading };
}

export function useFloors() {
  const { data, loading } = useCollection<Floor>("floors");
  return { floors: data, loading };
}
