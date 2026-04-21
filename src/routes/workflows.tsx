import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { WORKFLOW_STEPS, WORKFLOW_ASSIGNEES } from "@/lib/workflow-service";
const RESIDENCES = ["Steve Biko", "Campbell", "Corlo Court", "Winterton", "Student Village", "Stratford"] as const;
import { useAuth } from "@/lib/auth-context";
import {
  subscribeWorkflows,
  createWorkflow as fbCreateWorkflow,
  updateWorkflowStep,
  deleteWorkflow as fbDeleteWorkflow,
  addAttachment as fbAddAttachment,
  type Workflow,
  type Step,
  type WfStatus,
} from "@/lib/workflow-service";
import { createNotification } from "@/lib/notification-service";
import { toast } from "sonner";
import {
  AlertTriangle, CheckCircle2, Clock, Circle, Plus, Paperclip, MoreVertical,
  Bell, Trash2, Pencil, Search, X, FileText,
} from "lucide-react";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Project Workflows — DUT ResLife360" },
      { name: "description", content: "Track 7-step procurement workflows with accountability per step." },
    ],
  }),
  component: WorkflowsPage,
});

const STATUS_META: Record<WfStatus, { color: string; icon: typeof Circle; label: string }> = {
  completed: { color: "bg-success text-success-foreground", icon: CheckCircle2, label: "Completed" },
  in_progress: { color: "bg-warning text-warning-foreground", icon: Clock, label: "In Progress" },
  delayed: { color: "bg-destructive text-destructive-foreground", icon: AlertTriangle, label: "Delayed" },
  not_started: { color: "bg-muted text-muted-foreground", icon: Circle, label: "Not Started" },
};

const nowStamp = () => {
  const d = new Date();
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

function WorkflowsPage() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<{ wfId: string; stepIdx: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeWorkflows(user.uid, setWorkflows);
    return unsub;
  }, [user]);

  const filtered = useMemo(() => {
    return workflows.filter((w) => {
      const matchesSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.residence.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "all" || w.steps.some((s) => s.status === filterStatus);
      return matchesSearch && matchesStatus;
    });
  }, [workflows, search, filterStatus]);

  const totals = useMemo(
    () =>
      workflows.reduce(
        (acc, w) => {
          w.steps.forEach((s) => acc[s.status]++);
          return acc;
        },
        { completed: 0, in_progress: 0, delayed: 0, not_started: 0 } as Record<WfStatus, number>,
      ),
    [workflows],
  );

  const updateStep = async (wfId: string, stepIdx: number, patch: Partial<Step>) => {
    const wf = workflows.find((w) => w.id === wfId);
    if (!wf) return;
    const updatedSteps = wf.steps.map((s, i) =>
      i === stepIdx ? { ...s, ...patch, updated: nowStamp() } : s,
    );
    try {
      await updateWorkflowStep(wfId, updatedSteps);
    } catch {
      toast.error("Failed to update step");
    }
  };

  const addAttachment = async (wfId: string, stepIdx: number) => {
    const wf = workflows.find((w) => w.id === wfId);
    if (!wf) return;
    const fileName = `proof-${Date.now()}.pdf`;
    try {
      await fbAddAttachment(wfId, wf.steps, stepIdx, fileName);
      toast.success("Attachment uploaded", { description: fileName });
    } catch {
      toast.error("Failed to add attachment");
    }
  };

  const deleteWorkflow = async (wfId: string) => {
    try {
      await fbDeleteWorkflow(wfId);
      toast.success("Workflow deleted");
    } catch {
      toast.error("Failed to delete workflow");
    }
  };

  const notifyAssignee = async (assignee: string, context: string) => {
    if (!user) return;
    try {
      await createNotification({
        type: "alert",
        title: `Notification sent to ${assignee}`,
        message: context,
        userId: user.uid,
      });
      toast.success(`Notification sent to ${assignee}`, { description: context });
    } catch {
      toast.error("Failed to send notification");
    }
  };

  const handleCreateWorkflow = async (data: { name: string; residence: string; budget: string }) => {
    if (!user) return;
    try {
      await fbCreateWorkflow(user.uid, data);
      setCreateOpen(false);
      toast.success("Workflow created", { description: data.name });
    } catch {
      toast.error("Failed to create workflow");
    }
  };

  const editingStep =
    editing && workflows.find((w) => w.id === editing.wfId)?.steps[editing.stepIdx];

  return (
    <AppShell title="Project Workflows" subtitle="7-step procurement pipeline with accountability tracking">
      <div className="space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["completed", "in_progress", "delayed", "not_started"] as const).map((k) => {
            const m = STATUS_META[k];
            const Icon = m.icon;
            const active = filterStatus === k;
            return (
              <button
                key={k}
                onClick={() => setFilterStatus(active ? "all" : k)}
                className={`text-left transition ${active ? "ring-2 ring-primary rounded-xl" : ""}`}
              >
                <Card className="hover:shadow-md transition cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${m.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                      <div className="text-xl font-semibold">{totals[k]}</div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workflows or residences…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {filterStatus !== "all" && (
            <Button variant="ghost" size="sm" onClick={() => setFilterStatus("all")}>
              <X className="h-3.5 w-3.5 mr-1" />Clear filter
            </Button>
          )}
          <div className="ml-auto text-sm text-muted-foreground">{filtered.length} of {workflows.length} workflows</div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" />New workflow</Button>
            </DialogTrigger>
            <CreateWorkflowDialog onCreate={handleCreateWorkflow} />
          </Dialog>
        </div>

        {/* Alerts */}
        {workflows.some((w) => w.steps.some((s) => s.status === "delayed")) && (
          <div className="space-y-2">
            {workflows.flatMap((w) =>
              w.steps
                .map((s, i) => ({ s, i, w }))
                .filter(({ s }) => s.status === "delayed")
                .map(({ s, w }) => (
                  <Card key={`${w.id}-${s.name}`} className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="text-sm flex-1">
                        <div className="font-medium text-destructive">Delayed at {s.name} — {s.assignee}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{w.name} · {s.action}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => notifyAssignee(s.assignee, `${w.name} — ${s.name}`)}>
                        <Bell className="h-3.5 w-3.5 mr-1" />Notify
                      </Button>
                    </CardContent>
                  </Card>
                )),
            )}
          </div>
        )}

        {/* Workflows */}
        <div className="space-y-4">
          {filtered.map((wf) => (
            <Card key={wf.id}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{wf.name}</CardTitle>
                  <div className="text-xs text-muted-foreground mt-1">{wf.residence} · Budget {wf.budget}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {wf.steps.filter((s) => s.status === "completed").length}/{wf.steps.length} steps
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info("Workflow renamed (demo)")}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => notifyAssignee("All assignees", wf.name)}>
                        <Bell className="h-3.5 w-3.5 mr-2" />Notify all
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteWorkflow(wf.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {/* Horizontal tracker */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {wf.steps.map((s, i) => {
                    const m = STATUS_META[s.status];
                    const Icon = m.icon;
                    return (
                      <div key={i} className="flex items-center shrink-0">
                        <button
                          onClick={() => setEditing({ wfId: wf.id, stepIdx: i })}
                          className="flex flex-col items-center min-w-[110px] hover:opacity-80 transition group"
                        >
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${m.color} group-hover:ring-2 ring-primary/40`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-[11px] mt-1.5 text-center font-medium leading-tight">{s.name}</div>
                          <div className="text-[10px] text-muted-foreground">{s.assignee}</div>
                        </button>
                        {i < wf.steps.length - 1 && (
                          <div className={`h-0.5 w-8 ${wf.steps[i].status === "completed" ? "bg-success" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Step details list */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {wf.steps.filter((s) => s.status !== "not_started").map((s) => {
                    const stepIdx = wf.steps.indexOf(s);
                    const m = STATUS_META[s.status];
                    return (
                      <div key={stepIdx} className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/30">
                        <Badge className={`${m.color} shrink-0`} variant="secondary">{m.label}</Badge>
                        <div className="flex-1 min-w-0 text-sm">
                          <div className="font-medium">{s.name} — {s.assignee}</div>
                          <div className="text-xs text-muted-foreground">{s.action}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">Last updated: {s.updated}</div>
                          {s.attachments && s.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {s.attachments.map((a, ai) => (
                                <Badge key={ai} variant="outline" className="font-normal gap-1">
                                  <FileText className="h-3 w-3" />{a.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => addAttachment(wf.id, stepIdx)} title="Attach proof">
                            <Paperclip className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing({ wfId: wf.id, stepIdx })} title="Edit step">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                No workflows match your filters.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit step dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        {editing && editingStep && (
          <EditStepDialog
            step={editingStep}
            onSave={(patch) => {
              updateStep(editing.wfId, editing.stepIdx, patch);
              if (patch.status === "completed") {
                toast.success("Step completed", { description: `${editingStep.name} marked complete` });
              } else if (patch.status === "in_progress") {
                notifyAssignee(editingStep.assignee, `Action required: ${editingStep.name}`);
              } else {
                toast.success("Step updated");
              }
              setEditing(null);
            }}
            onClose={() => setEditing(null)}
          />
        )}
      </Dialog>
    </AppShell>
  );
}

function CreateWorkflowDialog({ onCreate }: { onCreate: (d: { name: string; residence: string; budget: string }) => void }) {
  const [name, setName] = useState("");
  const [residence, setResidence] = useState<string>(RESIDENCES[0]);
  const [budget, setBudget] = useState("");
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New workflow</DialogTitle>
        <DialogDescription>Creates a 7-step procurement pipeline with default assignees.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Project name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Air Conditioners — Steve Biko" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Residence</Label>
            <Select value={residence} onValueChange={setResidence}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESIDENCES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Budget</Label>
            <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="R 320,000" />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!name || !budget}
          onClick={() => onCreate({ name, residence, budget })}
        >Create workflow</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function EditStepDialog({ step, onSave, onClose }: {
  step: Step;
  onSave: (patch: Partial<Step>) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<WfStatus>(step.status);
  const [action, setAction] = useState(step.action);
  const [assignee, setAssignee] = useState(step.assignee);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Update step — {step.name}</DialogTitle>
        <DialogDescription>Changes auto-stamp the timestamp and notify the assignee.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as WfStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not started</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Assignee</Label>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORKFLOW_ASSIGNEES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Action / note</Label>
          <Textarea value={action} onChange={(e) => setAction(e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave({ status, action, assignee })}>Save & notify</Button>
      </DialogFooter>
    </DialogContent>
  );
}
