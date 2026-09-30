"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreatePin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/users/security/pin",
        {
          pin,
          confirmPin,
        }
      );

      toast.success(response.data.message);

      setPin("");
      setConfirmPin("");
    } catch (error: unknown) {
        console.error("PIN creation error:", error);

        if (axios.isAxiosError(error)) {
            toast.error(
            error.response?.data?.message ||
                "Failed to create PIN"
            );
        } else {
            toast.error("Failed to create PIN");
        }
        } finally {
            setLoading(false);
        }  
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            PIN & Security
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Protect your Finova transactions with a secure
            transaction PIN.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Create Transaction PIN
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="pin">
                Transaction PIN
              </Label>

              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) =>
                  setPin(
                    e.target.value.replace(/\D/g, "")
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">
                Confirm Transaction PIN
              </Label>

              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Confirm 4-digit PIN"
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(
                    e.target.value.replace(/\D/g, "")
                  )
                }
              />
            </div>

            <Button
              onClick={handleCreatePin}
              disabled={
                loading ||
                pin.length !== 4 ||
                confirmPin.length !== 4
              }
              className="w-full"
            >
              {loading
                ? "Creating PIN..."
                : "Create PIN"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}