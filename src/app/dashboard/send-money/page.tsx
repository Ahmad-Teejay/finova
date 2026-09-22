"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SendMoneyPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(""); 
  const [success, setSuccess] = useState("")
  const router = useRouter();

    const handleSubmit = async () => {
    setError("");

    const numericAmount = Number(amount);

    if (!recipient) {
        setError("Please enter a recipient");
        return;
    }

    if (!numericAmount || numericAmount <= 0) {
        setError("Amount must be greater than 0");
        return;
    }

    try {
        const response = await fetch("/api/transfer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            recipient,
            amount: numericAmount,
        }),
        });

        const data = await response.json();
        
        if (!response.ok) {
        setError(data.message || "Transfer failed");
        return;
        }

        console.log("Transfer successful:", data);
        setSuccess("Money sent successifully");

        setRecipient("");
        setAmount("");

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);

    } catch (error) {
        console.error("Transfer error:", error);
        setError("Something went wrong");
    }
    };
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Send Money</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">
                Recipient
              </Label>

              <Input
                id="recipient"
                placeholder="Enter username or email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="amount">
                Amount
              </Label>

              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-600">
                {success}
              </p>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full"
            >
              Send Money
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
