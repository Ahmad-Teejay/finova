"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  username: string;
}

export default function DashboardHeader({
  username,
}: DashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between border-b p-4">
      <div>
        <h1 className="text-xl font-semibold">Finova</h1>

        <p className="text-sm text-muted-foreground">
          Your digital wallet
        </p>
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open account menu"
        >
          {initial}
        </Button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-background p-2 shadow-lg">
            <div className="border-b px-3 py-2">
              <p className="text-sm font-medium">
                {username}
              </p>

              <p className="text-xs text-muted-foreground">
                Finova Account
              </p>
            </div>

            <div className="mt-1">
              <Link
                href="/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                Profile
              </Link>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                Settings
              </Link>

              <Link
                href="/dashboard/security"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              >
                PIN & Security
              </Link>

              <button
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  console.log("Logout clicked");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}