import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  residence: string;
  initials: string;
  active: boolean;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "teamMembers"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setMembers(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { members, loading }
}
