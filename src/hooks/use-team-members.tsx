import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  residence: string;
  initials: string;
  active: boolean;
  password?: string;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teamMembers"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) })) as TeamMember[]
      setMembers(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { members, loading }
}

export function useCurrentMember() {
  const { user } = useAuth();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const unsubscribe = onSnapshot(doc(db, "teamMembers", user.uid), (snap) => {
      if (snap.exists()) {
        setMember({ id: snap.id, ...(snap.data() as Record<string, unknown>) } as TeamMember);
      } else {
        setMember(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return { member, loading };
}
