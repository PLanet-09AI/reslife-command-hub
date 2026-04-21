import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut as fbSignOut } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTeamMembers, useCurrentMember, type TeamMember } from "@/hooks/use-team-members";
import { UserPlus, Pencil, Eye, EyeOff, Copy, Check } from "lucide-react";

// Secondary Firebase app — creates new users without signing out the current admin session
const secondaryApp =
  getApps().find((a) => a.name === "secondary") ??
  initializeApp(
    {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    },
    "secondary",
  );
const secondaryAuth = getAuth(secondaryApp);

const ROLES = ["Admin", "Manager", "Senior Admin", "Coordinator", "Budget Officer", "Finance Officer"];
const RESIDENCES = ["All", "Steve Biko", "Berea Hall", "Ritson Residence", "Ashmore Hall", "Klaarwater Residence", "—"];

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2);
}

async function addMember(data: { name: string; email: string; role: string; residence: string; password: string }) {
  const cred = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
  const uid = cred.user.uid;
  await setDoc(doc(db, "teamMembers", uid), {
    name: data.name,
    email: data.email,
    role: data.role,
    residence: data.residence,
    initials: getInitials(data.name),
    active: true,
    password: data.password,
  });
  await fbSignOut(secondaryAuth);
}

async function editMember(id: string, data: Partial<Omit<TeamMember, "id">>) {
  await updateDoc(doc(db, "teamMembers", id), data as Record<string, unknown>);
}

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Members — DUT ResLife360" },
      { name: "description", content: "Manage staff accounts, roles and credentials." },
    ],
  }),
  component: TeamPage,
});

type FormState = { name: string; email: string; role: string; residence: string; password: string };
const EMPTY_FORM: FormState = { name: "", email: "", role: "Coordinator", residence: "All", password: "" };

function TeamPage() {
  const { members, loading } = useTeamMembers();
  const { member: currentMember } = useCurrentMember();
  const isAdmin = currentMember?.role === "Admin";

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError("");
    setShowAdd(true);
  }

  function openEdit(m: TeamMember) {
    setForm({ name: m.name, email: m.email, role: m.role, residence: m.residence, password: m.password ?? "" });
    setFormError("");
    setEditTarget(m);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("Name, email and password are required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await addMember(form);
      setShowAdd(false);
    } catch (err: unknown) {
      setFormError((err as { message?: string }).message ?? "Failed to add member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    setFormError("");
    try {
      const updates: Partial<Omit<TeamMember, "id">> = {
        name: form.name,
        role: form.role,
        residence: form.residence,
        initials: getInitials(form.name),
      };
      if (form.password.trim()) updates.password = form.password.trim();
      await editMember(editTarget.id, updates);
      setEditTarget(null);
    } catch (err: unknown) {
      setFormError((err as { message?: string }).message ?? "Failed to update member.");
    } finally {
      setSaving(false);
    }
  }

  function toggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function copyPassword(m: TeamMember) {
    if (!m.password) return;
    await navigator.clipboard.writeText(m.password);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const colSpan = isAdmin ? 7 : 6;

  function MemberForm({ onSubmit, isEdit }: { onSubmit: (e: FormEvent) => void; isEdit: boolean }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5 col-span-2">
            <Label>Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Phumlani Mnyango"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              disabled={isEdit}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="name@dut.ac.za"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Residence</Label>
            <Select value={form.residence} onValueChange={(v) => setForm((f) => ({ ...f, residence: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESIDENCES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>{isEdit ? "Password (leave blank to keep current)" : "Password"}</Label>
            <Input
              type="text"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="DUT@2025!"
            />
          </div>
        </div>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => isEdit ? setEditTarget(null) : setShowAdd(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add member"}
          </Button>
        </DialogFooter>
      </form>
    );
  }

  return (
    <AppShell title="Team Members" subtitle="Manage staff accounts and access">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search team…"
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isAdmin && (
            <Button className="ml-auto" onClick={openAdd}>
              <UserPlus className="h-4 w-4 mr-1" /> Add member
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Residence</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Password</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={colSpan}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-8">
                      No team members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => {
                    const revealed = revealedIds.has(m.id);
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                              {m.initials}
                            </div>
                            <span className="font-medium">{m.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                        <TableCell><Badge variant="secondary">{m.role}</Badge></TableCell>
                        <TableCell className="text-sm">{m.residence}</TableCell>
                        <TableCell>
                          <Badge
                            className={m.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}
                            variant="secondary"
                          >
                            {m.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-sm text-muted-foreground select-none">
                                {revealed ? (m.password ?? "—") : "••••••••"}
                              </span>
                              <Button
                                size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => toggleReveal(m.id)}
                                title={revealed ? "Hide password" : "Show password"}
                              >
                                {revealed
                                  ? <EyeOff className="h-3.5 w-3.5" />
                                  : <Eye className="h-3.5 w-3.5" />}
                              </Button>
                              {m.password && (
                                <Button
                                  size="sm" variant="ghost" className="h-7 w-7 p-0"
                                  onClick={() => copyPassword(m)}
                                  title="Copy password"
                                >
                                  {copiedId === m.id
                                    ? <Check className="h-3.5 w-3.5 text-success" />
                                    : <Copy className="h-3.5 w-3.5" />}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          {isAdmin && (
                            <Button
                              size="sm" variant="ghost" className="h-8 px-2"
                              onClick={() => openEdit(m)}
                              title="Edit member"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add member dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <MemberForm onSubmit={handleAdd} isEdit={false} />
        </DialogContent>
      </Dialog>

      {/* Edit member dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <MemberForm onSubmit={handleEdit} isEdit={true} />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
