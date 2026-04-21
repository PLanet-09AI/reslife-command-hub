import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { RESIDENCES, ROLES } from "@/lib/mock-data";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Add Team Member — DUT ResLife360" }],
  }),
  component: RegisterPage,
});

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: string;
  residence: string;
  active: boolean;
}

function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    role: "",
    residence: "",
    active: true,
  });

  const initials = form.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const set = <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) {
      toast.error("Please select a role");
      return;
    }
    setLoading(true);
    try {
      const cred = await signUp(form.email, form.password);
      await setDoc(doc(db, "teamMembers", cred.user.uid), {
        name: form.name,
        email: form.email,
        role: form.role,
        residence: form.residence || "All",
        initials,
        active: form.active,
      });
      toast.success("Team member added successfully");
      navigate({ to: "/team" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            DUT
          </div>
          <CardTitle className="text-xl">Add Team Member</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            ResLife360 Command Center
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. Alvin Smith"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@dut.ac.za"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select onValueChange={(v) => set("role", v)} value={form.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Residence</Label>
                <Select
                  onValueChange={(v) => set("residence", v)}
                  value={form.residence}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All / specific" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {RESIDENCES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(v) => set("active", v)}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: "/team" })}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating…" : "Add Member"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
