import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Paperclip,
  ChevronRight,
  ChevronLeft,
  UserCheck,
} from "lucide-react";
import { useCurrentMember } from "@/hooks/use-team-members";
import {
  subscribeWorkflows,
  updateWorkflowStep,
  addAttachment as fbAddAttachment,
  type Workflow,
  type WfStatus,
} from "@/lib/workflow-service";
import { toast } from "sonner";

export const Route = createFileRoute("/my-work")({
  head: () => ({
    meta: [
      { title: "My Work — DUT ResLife360" },
      { name: "description", content: "Your assigned workflow steps — act on your part." },
    ],
  }),
  component: MyWorkPage,
});

const STATUS_META: Record<WfStatus, { color: string; icon: typeof Circle; label: string; bg: string }> = {
  completed:   { color: "text-success",              icon: CheckCircle2,  label: "Completed",   bg: "bg-success/10 border-success/30" },
  in_progress: { color: "text-warning-foreground",   icon: Clock,         label: "In Progress", bg: "bg-warning/10 border-warning/30" },
  delayed:     { color: "text-destructive",           icon: AlertTriangle, label: "Delayed",     bg: "bg-destructive/5 border-destructive/30" },
  not_started: { color: "text-muted-foreground",      icon: Circle,        label: "Not Started", bg: "bg-muted/40 border-border" },
};

const nowStamp = () =>
  new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function MyWorkPage() {
  const { member, loading: loadingMember } = useCurrentMember();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loadingWf, setLoadingWf] = useState(true);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeWorkflows((wfs) => { setWorkflows(wfs); setLoadingWf(false); });
    return unsub;
  }, []);

  // Collect all steps assigned to the current user
  const mySteps = workflows.flatMap((wf) =>
    wf.steps
      .map((s, i) => ({ wf, step: s, stepIdx: i }))
      .filter(({ step }) => member && step.assignee === member.name),
  );

  const noteKey = (wfId: string, idx: number) => `${wfId}-${idx}`;

  const updateStatus = async (wfId: string, stepIdx: number, status: WfStatus) => {
    const key = noteKey(wfId, stepIdx);
    setSaving(key);
    const wf = workflows.find((w) => w.id === wfId);
    if (!wf) return;
    const note = noteMap[key] ?? wf.steps[stepIdx].action;
    const updatedSteps = wf.steps.map((s, i) =>
      i === stepIdx ? { ...s, status, action: note, updated: nowStamp() } : s,
    );
    try {
      await updateWorkflowStep(wfId, updatedSteps);
      toast.success(`Step marked ${status.replace("_", " ")}`, { description: wf.name });
    } catch {
      toast.error("Failed to update step");
    } finally {
      setSaving(null);
    }
  };

  const attachProof = async (wfId: string, stepIdx: number) => {
    const wf = workflows.find((w) => w.id === wfId);
    if (!wf) return;
    const fileName = `proof-${Date.now()}.pdf`;
    try {
      await fbAddAttachment(wfId, wf.steps, stepIdx, fileName);
      toast.success("Proof attached", { description: fileName });
    } catch {
      toast.error("Failed to attach proof");
    }
  };

  const loading = loadingMember || loadingWf;

  return (
    <AppShell
      title="My Work"
      subtitle={member ? `Steps assigned to you, ${member.name} · ${member.role}` : "Your assigned workflow steps"}
    >
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : mySteps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-success" />
          </div>
          <div className="text-lg font-semibold">You're all clear</div>
          <div className="text-sm text-muted-foreground max-w-xs">
            No workflow steps are currently assigned to you. Check back when a new workflow is created.
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="text-sm text-muted-foreground font-medium">
            {mySteps.length} step{mySteps.length > 1 ? "s" : ""} waiting for you
          </div>

          {mySteps.map(({ wf, step, stepIdx }) => {
            const m = STATUS_META[step.status];
            const Icon = m.icon;
            const key = noteKey(wf.id, stepIdx);
            const isSaving = saving === key;
            const prevStep = stepIdx > 0 ? wf.steps[stepIdx - 1] : null;
            const nextStep = stepIdx < wf.steps.length - 1 ? wf.steps[stepIdx + 1] : null;

            return (
              <Card key={key} className={`border-2 ${m.bg}`}>
                <CardContent className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        {wf.residence} · {wf.budget}
                      </div>
                      <div className="font-semibold text-base">{wf.name}</div>
                    </div>
                    <Badge className={`${m.color} shrink-0`} variant="outline">
                      <Icon className="h-3.5 w-3.5 mr-1" />{m.label}
                    </Badge>
                  </div>

                  {/* Step name */}
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                      {stepIdx + 1}
                    </span>
                    {step.name}
                  </div>

                  {/* Pipeline context */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto">
                    {prevStep && (
                      <>
                        <span className="text-muted-foreground/60">{prevStep.name}</span>
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      </>
                    )}
                    <span className="font-semibold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {step.name} ← you
                    </span>
                    {nextStep && (
                      <>
                        <ChevronRight className="h-3 w-3 shrink-0" />
                        <span className="text-muted-foreground/60">{nextStep.name}</span>
                      </>
                    )}
                  </div>

                  {/* Note field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Action / notes</label>
                    <Textarea
                      rows={2}
                      placeholder="Describe what you did or any blockers…"
                      value={noteMap[key] ?? step.action ?? ""}
                      onChange={(e) => setNoteMap((prev) => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>

                  {/* Attachments */}
                  {step.attachments && step.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {step.attachments.map((a, ai) => (
                        <Badge key={ai} variant="outline" className="font-normal text-xs gap-1">
                          <Paperclip className="h-3 w-3" />{a.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {step.status !== "in_progress" && step.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => updateStatus(wf.id, stepIdx, "in_progress")}
                      >
                        <Clock className="h-3.5 w-3.5 mr-1" />Start working
                      </Button>
                    )}
                    {step.status !== "completed" && (
                      <Button
                        size="sm"
                        disabled={isSaving}
                        onClick={() => updateStatus(wf.id, stepIdx, "completed")}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Mark complete
                      </Button>
                    )}
                    {step.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => updateStatus(wf.id, stepIdx, "in_progress")}
                      >
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" />Reopen
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => updateStatus(wf.id, stepIdx, "delayed")}
                      className="text-destructive border-destructive/30 hover:bg-destructive/5"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />Flag delay
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSaving}
                      onClick={() => attachProof(wf.id, stepIdx)}
                    >
                      <Paperclip className="h-3.5 w-3.5 mr-1" />Attach proof
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
