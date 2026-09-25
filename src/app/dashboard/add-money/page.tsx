"use client";

import { useState, useEffect } from "react";
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

export default function AddMoneyPage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
  const verifyPayment = async () => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (!reference) {
      return;
    }

    try {
      const response = await fetch(
        `/api/payments/verify?reference=${reference}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Payment verification failed");
        return;
      }

      router.push("/dashboard");
      
        if (data.amount !== undefined) {
             setSuccess(`₦${data.amount.toLocaleString()} added successfully`);
        } else {
          setSuccess(data.message);
        }

        console.log("Payment verified:", data);

    } catch (error) {
      console.error(error);
      setError("Unable to verify payment");
    }
  };

  verifyPayment();
}, [router]);

  const handleSubmit = async () => {
    setError("");

    const numericAmount = Number(amount);

    if(!numericAmount){
        setError("Please enter an amount");
        return;
    }

    if(numericAmount <= 0){
        setError("Amount must be greater than 0");
        return;
    }

    if(numericAmount < 100){
        setError("Minimum amount is ₦100");
        return;
    };

   console.log("Valid amount:", numericAmount);
  

  try {
    const response = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: numericAmount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to initialize payment");
      return;
    }

    window.location.href = data.authorizationUrl;
  } catch (error) {
    console.error(error);
    setError("Something went wrong");
  }
  }
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add Money</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="mb-4 space-y-2">
              <Label htmlFor="amount">Amount</Label>

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
            className="w-full">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}