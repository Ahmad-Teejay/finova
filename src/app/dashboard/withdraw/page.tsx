"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";


interface Bank {
  name: string;
  code: string;
}

export default function WithdrawPage() {
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [amount, setAmount] = useState("");

  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountName, setAccountName] = useState("");

  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 

  // Fetch banks
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

  // Verify bank account
  const verifyAccount = async (
    currentAccountNumber: string,
    currentBankCode: string
  ) => {
    setError("");
    setAccountName("");

    if (!currentBankCode) {
      setError("Please select your bank");
      return;
    }

    if (currentAccountNumber.length !== 10) {
      setError("Account number must be 10 digits");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await fetch(
        `/api/banks/resolve?accountNumber=${currentAccountNumber}&bankCode=${currentBankCode}`
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

  // Handle account number
  const handleAccountNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "");

    setAccountNumber(value);
    setAccountName("");
    setError("");

    if (value.length === 10 && bankCode) {
      verifyAccount(value, bankCode);
    }
  };

  // Handle bank selection
  const handleBankChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedBankCode = e.target.value;

    const selectedBank = banks.find(
      (bank) => bank.code === selectedBankCode
    );

    setBankCode(selectedBankCode);
    setBankName(selectedBank?.name || "");
    setAccountName("");
    setError("");

    if (accountNumber.length === 10 && selectedBankCode) {
      verifyAccount(accountNumber, selectedBankCode);
    }
  };

  // Remove duplicate banks
  const uniqueBanks = Array.from(
    new Map(
      banks
        .filter((bank) => bank?.code && bank?.name)
        .map((bank) => [`${bank.code}-${bank.name}`, bank])
    ).values()
  );

  // Handle withdrawal
  const handleSubmit = async () => {
    setError("");

    if (!accountNumber) {
      setError("Please enter your account number");
      return;
    }

    if (accountNumber.length !== 10) {
      setError("Account number must be 10 digits");
      return;
    }

    if (!bankCode || !bankName) {
      setError("Please select your bank");
      return;
    }

    if (!accountName) {
      setError("Please verify your bank account first");
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (numericAmount < 100) {
      setError("Minimum withdrawal amount is ₦100");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNumber,
          bankName,
          bankCode,
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
      setBankCode("");
      setAccountName("");
      setAmount("");
    } catch (error) {
      console.error("Withdrawal error:", error);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
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

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="accountNumber">
                Bank Account Number
              </Label>

              <Input
                id="accountNumber"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter account number"
                value={accountNumber}
                onChange={handleAccountNumberChange}
              />
            </div>

            {/* Bank */}
            <div className="space-y-2">
              <Label htmlFor="bank">
                Bank
              </Label>

              <select
                id="bank"
                value={bankCode}
                onChange={handleBankChange}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Select your bank
                </option>

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

            {/* Account Verification */}
            {isVerifying && (
              <p className="text-sm text-muted-foreground">
                Verifying account...
              </p>
            )}

            {accountName && !isVerifying && (
              <div className="rounded-md border bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  Account Name
                </p>

                <p className="font-medium">
                  {accountName}
                </p>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount
              </Label>

              <Input
                id="amount"
                type="number"
                min="100"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Withdraw Button */}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isVerifying}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Withdraw"}
            </Button>

          </div>
        </CardContent>
      </Card>
    </main>
  );
}