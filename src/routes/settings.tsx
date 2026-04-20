import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DUT ResLife360" },
      { name: "description", content: "Manage your profile and system preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Profile, security and notification preferences">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>First name</Label><Input defaultValue="Alvin" className="mt-1" /></div>
              <div><Label>Last name</Label><Input defaultValue="Smith" className="mt-1" /></div>
            </div>
            <div><Label>Email</Label><Input defaultValue="alvin.smith@dut.ac.za" className="mt-1" /></div>
            <div><Label>Role</Label><Input defaultValue="Admin (Dashboard Owner)" disabled className="mt-1" /></div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Email — new comments", true],
              ["Email — approval requests", true],
              ["Email — workflow delays", true],
              ["In-app — uploads", false],
              ["Weekly digest", true],
            ].map(([label, val]) => (
              <div key={label as string} className="flex items-center justify-between">
                <Label className="text-sm">{label}</Label>
                <Switch defaultChecked={val as boolean} />
              </div>
            ))}
            <Separator />
            <Button variant="outline" className="w-full">Reset to defaults</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
