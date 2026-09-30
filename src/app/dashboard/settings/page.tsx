import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your Finova account and security preferences.
          </p>
        </div>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <Link
              href="/dashboard/profile"
              className="block rounded-lg border p-4 transition hover:bg-muted"
            >
              <p className="font-medium">Profile</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage your username and account information.
              </p>
            </Link>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <Link
              href="/dashboard/security"
              className="block rounded-lg border p-4 transition hover:bg-muted"
            >
              <p className="font-medium">PIN & Security</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage your transaction PIN and account security.
              </p>
            </Link>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border p-4">
              <p className="font-medium">Notification Preferences</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Control how Finova notifies you about transactions,
                security events, and account activity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}