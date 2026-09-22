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

export default function WithdrawPage() {
  const [accountNumber, setAccountNumber] = useState("");
const [bankName, setBankName] = useState("");
const [bankCode, setBankCode] = useState("");
const [amount, setAmount] = useState("");
const [error, setError] = useState("");

const [banks, setBanks] = useState<
  { name: string; code: string }[]
>([]);

const [accountName, setAccountName] = useState("");
const [isVerifying, setIsVerifying] = useState(false);

useEffect(() => {
  const fetchBanks = async () => {
    try {
      const response = await fetch("/api/banks");

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch banks");
        return;
      }

      setBanks(data.banks);
    } catch (error) {
      console.error("Fetch banks error:", error);
      setError("Unable to load banks");
    }
  };

  fetchBanks();
}, []);

useEffect(() => {
  if (accountNumber.length !== 10 || !bankCode) {
    setAccountName("");
    return;
  }

  verifyAccount();
}, [accountNumber, bankCode]);

  const verifyAccount = async () => {
    setError("");
    setAccountName("");

    if (!bankCode) {
      setError("Please select your bank");
      return;
    }

    if (!accountNumber) {
      setError("Please enter your account number");
      return;
    }

    if (accountNumber.length !== 10) {
      setError("Account number must be 10 digits");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await fetch(
        `/api/banks/resolve?accountNumber=${accountNumber}&bankCode=${bankCode}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to verify account");
        return;
      }

      setAccountName(data.accountName);
    } catch (error) {
      console.error("Account verification error:", error);
      setError("Unable to verify account");
    } finally {
      setIsVerifying(false);
    }
  };

  const uniqueBanks = Array.from(
    new Map(
      banks
        .filter((bank) => bank?.code && bank?.name)
        .map((bank) => [`${bank.code}-${bank.name}`, bank])
    ).values()
  );

  const handleSubmit = async () => {
    if (!accountName) {
        setError("Please verify your bank account first");
        return;
    }
  setError("");

  const numericAmount = Number(amount);

  if (!accountNumber) {
    setError("Please enter your account number");
    return;
  }

  if (!bankName) {
    setError("Please enter your bank name");
    return;
  }

  if (!numericAmount || numericAmount <= 0) {
    setError("Please enter a valid amount");
    return;
  }

  if (numericAmount < 100) {
    setError("Minimum withdrawal amount is ₦100");
    return;
  }

  try {
    const response = await fetch("/api/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountNumber,
        bankName,
        bankCode: bankCode,
        amount: numericAmount,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Withdrawal failed");
      return;
    }

    console.log("Withdrawal successful:", data);

    setAccountNumber("");
    setBankName("");
    setAmount("");
  } catch (error) {
    console.error("Withdrawal error:", error);
    setError("Something went wrong");
  }
};

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Withdraw Money</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="mt-4 space-y-2">
              <Label htmlFor="accountNumber">
                Bank Account Number
              </Label>

              <Input
                id="accountNumber"
                type="text"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className="mt-4 space-y-2">
            <Label htmlFor="bank">
                Bank 
            </Label>

            <select
                id="bank"
                value={bankCode}
                onChange={(e) => {
                const selectedBank = banks.find(
                    (bank) => bank.code === e.target.value
                );

                setBankCode(e.target.value);
                setBankName(selectedBank?.name || "");
                }}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
                <option value="">Select your bank</option>

                {uniqueBanks.map((bank, index) => (
                    <option
                        key={`${bank.code}-${bank.name}-${index}`}
                        value={bank.code}
                    >
                        {bank.name}
                    </option>
                ))}
            </select>
        </div>

        {isVerifying && (
            <p className="text-sm text-muted-foreground">
                Verifying account...
            </p>
            )}

        {accountName && (
            <div className="rounded-md border bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                Account Name
                </p>

                <p className="font-medium">
                {accountName}
                </p>
            </div>
        )}  

       <div className="mt-4 space-y-2">
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

            <Button
              onClick={handleSubmit}
              className="w-full"
            >
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}