"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
  accountNumber: string;
}

export default function BalanceCard({
  balance,
  accountNumber,
}: BalanceCardProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      toast.success("Account number copied");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy account number");
    }
  };

  return (
    <Card className="border-blue-950 bg-linear-to-br from-[#071A3D] via-[#0B2855] to-[#06142E] text-white shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Available Balance
          </CardTitle>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text white">
              {accountNumber}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              aria-label="Copy account number"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="font-sans text-4xl font-semibold tracking-[-0.02em] tabular-nums">
          ₦{balance.toLocaleString("en-NG")}
        </p>
      </CardContent>
    </Card>
  );
}