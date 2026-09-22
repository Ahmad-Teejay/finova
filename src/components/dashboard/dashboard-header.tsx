import { Button } from "@/components/ui/button";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b p-4">
      <div>
        <h1 className="text-xl font-semibold">Finova</h1>
        <p className="text-sm text-muted-foreground">
          Your digital wallet
        </p>
      </div>

      <Button variant="outline">
        Account
      </Button>
    </header>
  );
}