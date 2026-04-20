import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type NotificationType = "comment" | "approval" | "alert" | "upload";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  workflowId?: string;
  userId: string;
  read: boolean;
  createdAt: unknown;
};

const COL = "notifications";

export function subscribeNotifications(
  uid: string,
  callback: (notifications: Notification[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, COL),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({
      ...(d.data() as Omit<Notification, "id">),
      id: d.id,
    }));
    callback(items);
  });
}

export async function createNotification(data: {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  workflowId?: string;
}) {
  await addDoc(collection(db, COL), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function markAsRead(notificationId: string) {
  await updateDoc(doc(db, COL, notificationId), { read: true });
}
