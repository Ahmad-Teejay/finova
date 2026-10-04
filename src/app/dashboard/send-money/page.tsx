"use client";

import { useRef, useState } from "react";
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
import { toast } from "sonner";

export default function SendMoneyPage() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const [accountNumber, setAccountNumber] = useState("");

  const [recipient, setRecipient] = useState<{
    fullName: string;
    accountNumber: string;
  } | null>(null);

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");

  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Transaction PIN
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  // PIN lock state
  const [pinLocked, setPinLocked] = useState(false);
  const [pinLockMessage, setPinLockMessage] = useState("");

  // References for the four PIN inputs
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Automatically lookup account when 10 digits are entered
  const handleAccountNumberChange = async (value: string) => {
    const cleanedValue = value.replace(/\D/g, "");

    setAccountNumber(cleanedValue);
    setRecipient(null);
    setLookupMessage("");
    setError("");

    // Not yet 10 digits
    if (cleanedValue.length > 0 && cleanedValue.length < 10) {
      setLookupMessage("Invalid account number");
      return;
    }

    // Don't lookup when empty
    if (cleanedValue.length === 0) {
      return;
    }

    // Lookup when exactly 10 digits
    if (cleanedValue.length === 10) {
      try {
        setLookupLoading(true);

        const response = await fetch(
          `/api/users/lookup?accountNumber=${cleanedValue}`
        );

        const data = await response.json();

        if (!response.ok) {
          setLookupMessage(data.message || "Account not found");
          return;
        }

        setRecipient(data.recipient);
      } catch (error) {
        console.error("Account lookup error:", error);
        setLookupMessage("Unable to verify account");
      } finally {
        setLookupLoading(false);
      }
    }
  };

  // Handle PIN input
  const handlePinChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");

    // Handle paste of multiple digits
    if (digits.length > 1) {
      const pastedPin = digits.slice(0, 4);

      setPin(pastedPin);

      const focusIndex = Math.min(pastedPin.length, 3);

      setTimeout(() => {
        pinRefs.current[focusIndex]?.focus();
      }, 0);

      return;
    }

    const digit = digits.slice(-1);

    const pinArray = pin.padEnd(4, "").split("");

    pinArray[index] = digit;

    const newPin = pinArray.join("");

    setPin(newPin);

    // Move to next input
    if (digit && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  // Handle PIN backspace
  const handlePinKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Backspace" &&
      !pin[index] &&
      index > 0
    ) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    if (pinLoading) return;

    setShowConfirmModal(false);
    setPin("");
    setError("");
  };

  // Open confirmation modal
  const openConfirmModal = () => {
    setError("");

    if (pinLocked) {
      toast.error(
        pinLockMessage || "Transaction PIN is currently locked.",
        {
          duration: 5000,
        }
      );

      return;
    }

    if (!recipient) {
      setError("Please enter a valid recipient account number");
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setPin("");
    setShowConfirmModal(true);

    setTimeout(() => {
      pinRefs.current[0]?.focus();
    }, 100);
  };

  // Confirm transfer
  const handleConfirmTransfer = async () => {
    setError("");
    setSuccess("");

    const numericAmount = Number(amount);

    if (!recipient) {
      setError("Please enter a valid recipient account number");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast.error("Please enter your 4-digit transaction PIN");
      return;
    }

    try {
      setPinLoading(true);

      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: recipient.accountNumber,
          amount: numericAmount,
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // PIN locked
        if (response.status === 403) {
          setPinLocked(true);
          setPinLockMessage(
            data.message ||
              "Your transaction PIN is temporarily locked."
          );

          toast.error(
            data.message || "Transaction PIN is locked",
            {
              duration: 5000,
            }
          );

          setPin("");
          setShowConfirmModal(false);

          return;
        }

        // Other transfer errors
        toast.error(data.message || "Transfer failed");
        setPin("");

        return;
      }

      console.log("Transfer successful:", data);

      toast.success("Money sent successfully");

      setSuccess("Money sent successfully");

      setShowConfirmModal(false);
      setPin("");

      setRecipient(null);
      setAccountNumber("");
      setAmount("");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Something went wrong");
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        {/* PIN LOCK WARNING */}
        {pinLocked && (
          <div className="mb-4 w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-red-600">
                🔒
              </div>

              <div>
                <p className="font-semibold text-red-800">
                  Transaction PIN Locked
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {pinLockMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Send Money</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Account Number */}
              <div className="space-y-2">
                <Label htmlFor="accountNumber">
                  Account Number
                </Label>

                <Input
                  id="accountNumber"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit account number"
                  value={accountNumber}
                  onChange={(e) =>
                    handleAccountNumberChange(e.target.value)
                  }
                />

                {lookupLoading && (
                  <p className="text-sm text-muted-foreground">
                    Checking account...
                  </p>
                )}

                {!lookupLoading &&
                  lookupMessage &&
                  !recipient && (
                    <p className="text-sm text-destructive">
                      {lookupMessage}
                    </p>
                  )}

                {recipient && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-medium text-green-700">
                      ACCOUNT HOLDER
                    </p>

                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {recipient.fullName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {recipient.accountNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount
                </Label>

                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  min="1"
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

              {/* Success */}
              {success && (
                <p className="text-sm text-green-600">
                  {success}
                </p>
              )}

              {/* Send Money */}
              <Button
                onClick={openConfirmModal}
                disabled={
                  !recipient ||
                  !amount ||
                  pinLocked
                }
                className="mt-6 w-full border-blue-950 bg-linear-to-br from-[#071A3D] via-[#0B2855] to-[#06142E] text-white shadow-xl"
              >
                {pinLocked
                  ? "Transaction PIN Locked"
                  : "Send Money"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Backdrop */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-transfer-title"
          >
            {/* Header */}
            <div className="mb-6">
              <h2
                id="confirm-transfer-title"
                className="text-xl font-semibold text-slate-900"
              >
                Confirm Transfer
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review the details before confirming your transfer.
              </p>
            </div>

            {/* Transfer Details */}
            <div className="space-y-4">
              {/* Recipient */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Account Holder
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {recipient?.fullName}
                </p>

                <p className="text-sm text-slate-500">
                  {recipient?.accountNumber}
                </p>
              </div>

              {/* Amount */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Amount
                </p>

                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  ₦{Number(amount).toLocaleString("en-NG")}
                </p>
              </div>

              {/* PIN */}
              <div className="space-y-3">
                <div>
                  <Label>
                    Transaction PIN
                  </Label>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter your 4-digit PIN to authorize this transfer.
                  </p>
                </div>

                {/* Four PIN Inputs */}
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <Input
                      key={index}
                      ref={(element) => {
                        pinRefs.current[index] = element;
                      }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={pin[index] || ""}
                      onChange={(e) =>
                        handlePinChange(
                          index,
                          e.target.value
                        )
                      }
                      onKeyDown={(e) =>
                        handlePinKeyDown(index, e)
                      }
                      className="h-14 w-14 rounded-xl text-center text-xl font-semibold sm:h-16 sm:w-16"
                      aria-label={`PIN digit ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeConfirmModal}
                disabled={pinLoading}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={
                  pin.length !== 4 ||
                  pinLoading
                }
                className="flex-1 border-blue-950 bg-linear-to-br from-[#071A3D] via-[#0B2855] to-[#06142E] text-white"
              >
                {pinLoading
                  ? "Confirming..."
                  : "Confirm Transfer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}