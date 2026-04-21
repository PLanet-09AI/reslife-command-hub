import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useTeamMembers } from "@/hooks/use-team-members";
import { UserPlus, Copy, KeyRound } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team Members — DUT ResLife360" },
      { name: "description", content: "Manage staff accounts, roles and credentials." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { members, loading } = useTeamMembers();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <Button className="ml-auto" onClick={() => navigate({ to: "/register" })}>
            <UserPlus className="h-4 w-4 mr-1" />Add member
          </Button>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No team members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => (
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
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-8 px-2"><KeyRound className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2"><Copy className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
