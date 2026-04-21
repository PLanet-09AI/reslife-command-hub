import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { compressToBase64 } from "./file-utils";

export const WORKFLOW_STEPS = [
  "Submission",
  "Finance Processing",
  "Requisition Approval",
  "Senior Approval",
  "Purchase Order",
  "Delivery",
  "Invoice & Payment",
];

export const WORKFLOW_ASSIGNEES = [
  "Sihle Zulu",
  "Sifiso Mvubu",
  "Nonhlanhla Mbatha",
  "Phumlani Mnyango",
  "Procurement Office",
  "Logistics",
  "Finance Office",
];

export type WfStatus = "completed" | "in_progress" | "delayed" | "not_started";

export type Attachment = {
  name: string;
  type: string;    // MIME type
  size: number;    // original file size in bytes
  data: string;    // gzip-compressed, base64-encoded content
};

export type Step = {
  name: string;
  assignee: string;
  status: WfStatus;
  updated: string;
  action: string;
  attachments?: Attachment[];
};

export type Workflow = {
  id: string;
  name: string;
  residence: string;
  budget: string;
  createdBy: string;
  createdAt: unknown;
  steps: Step[];
};

const COL = "workflows";

export function subscribeWorkflows(
  callback: (workflows: Workflow[]) => void,
): Unsubscribe {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const workflows = snap.docs.map((d) => ({
      ...(d.data() as Omit<Workflow, "id">),
      id: d.id,
    }));
    callback(workflows);
  });
}

export async function createWorkflow(
  uid: string,
  data: { name: string; residence: string; budget: string },
) {
  const steps: Step[] = WORKFLOW_STEPS.map((name, i) => ({
    name,
    assignee: WORKFLOW_ASSIGNEES[i] ?? "Unassigned",
    status: "not_started",
    updated: "—",
    action: "—",
  }));

  await addDoc(collection(db, COL), {
    name: data.name,
    residence: data.residence,
    budget: data.budget,
    createdBy: uid,
    createdAt: serverTimestamp(),
    steps,
  });
}

export async function updateWorkflowStep(
  workflowId: string,
  steps: Step[],
) {
  await updateDoc(doc(db, COL, workflowId), { steps });
}

export async function deleteWorkflow(workflowId: string) {
  await deleteDoc(doc(db, COL, workflowId));
}

export async function addAttachment(
  workflowId: string,
  steps: Step[],
  stepIndex: number,
  file: File,
): Promise<void> {
  const data = await compressToBase64(file);
  const attachment: Attachment = {
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    data,
  };
  const updated = steps.map((s, i) =>
    i === stepIndex
      ? { ...s, attachments: [...(s.attachments ?? []), attachment] }
      : s,
  );
  await updateDoc(doc(db, COL, workflowId), { steps: updated });
}
