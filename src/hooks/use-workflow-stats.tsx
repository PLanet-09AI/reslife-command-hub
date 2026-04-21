import { useEffect, useState } from "react";
import { subscribeWorkflows, type Workflow, type WfStatus } from "@/lib/workflow-service";

export interface WorkflowStats {
  total: number;
  completed: number;     // workflows where every step is completed
  inProgress: number;    // workflows with at least one in_progress step
  delayed: number;       // workflows with at least one delayed step
  notStarted: number;    // workflows where all steps are not_started
  stepCounts: Record<WfStatus, number>;
  byResidence: { residence: string; total: number; completed: number; inProgress: number }[];
  myStepsTotal: number;
  recentUpdates: { wfName: string; stepName: string; assignee: string; status: WfStatus; updated: string }[];
}

function classifyWorkflow(wf: Workflow): WfStatus {
  const steps = wf.steps;
  if (steps.every((s) => s.status === "completed")) return "completed";
  if (steps.some((s) => s.status === "delayed")) return "delayed";
  if (steps.some((s) => s.status === "in_progress")) return "in_progress";
  return "not_started";
}

export function useWorkflowStats(currentMemberName?: string) {
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0, completed: 0, inProgress: 0, delayed: 0, notStarted: 0,
    stepCounts: { completed: 0, in_progress: 0, delayed: 0, not_started: 0 },
    byResidence: [],
    myStepsTotal: 0,
    recentUpdates: [],
  });
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeWorkflows((wfs) => { setWorkflows(wfs); setLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    if (loading) return;
    const stepCounts: Record<WfStatus, number> = { completed: 0, in_progress: 0, delayed: 0, not_started: 0 };
    let completed = 0, inProgress = 0, delayed = 0, notStarted = 0, myStepsTotal = 0;
    const residenceMap: Record<string, { total: number; completed: number; inProgress: number }> = {};
    const recentUpdates: WorkflowStats["recentUpdates"] = [];

    for (const wf of workflows) {
      const wfStatus = classifyWorkflow(wf);
      if (wfStatus === "completed") completed++;
      else if (wfStatus === "in_progress") inProgress++;
      else if (wfStatus === "delayed") delayed++;
      else notStarted++;

      const res = wf.residence;
      if (!residenceMap[res]) residenceMap[res] = { total: 0, completed: 0, inProgress: 0 };
      residenceMap[res].total++;
      if (wfStatus === "completed") residenceMap[res].completed++;
      else if (wfStatus === "in_progress") residenceMap[res].inProgress++;

      for (const s of wf.steps) {
        stepCounts[s.status]++;
        if (currentMemberName && s.assignee === currentMemberName && s.status !== "completed") {
          myStepsTotal++;
        }
        if (s.status !== "not_started" && s.updated && s.updated !== "—") {
          recentUpdates.push({ wfName: wf.name, stepName: s.name, assignee: s.assignee, status: s.status, updated: s.updated });
        }
      }
    }

    // Sort recent by updated desc (string sort is fine for our locale format)
    recentUpdates.sort((a, b) => b.updated.localeCompare(a.updated));

    setStats({
      total: workflows.length,
      completed, inProgress, delayed, notStarted,
      stepCounts,
      byResidence: Object.entries(residenceMap).map(([residence, v]) => ({ residence, ...v })),
      myStepsTotal,
      recentUpdates: recentUpdates.slice(0, 8),
    });
  }, [workflows, loading, currentMemberName]);

  return { stats, loading };
}
