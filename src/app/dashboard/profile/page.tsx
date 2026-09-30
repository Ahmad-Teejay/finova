"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserProfile {
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/users/profile");
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load profile");
          return;
        }

        setUser(data.user);
        setUsername(data.user.username);
      } catch (error) {
        console.error("Profile fetch error:", error);
        setError("Unable to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setError("");
    setMessage("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update username");
        return;
      }

      setUser(data.user);
      setUsername(data.user.username);
      setIsEditing(false);
      setMessage("Username updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      setError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setUsername(user.username);
    }

    setIsEditing(false);
    setError("");
    setMessage("");
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-muted-foreground">Loading profile...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <p className="text-sm text-destructive">
          {error || "Unable to load profile"}
        </p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile</CardTitle>

          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(true);
                setMessage("");
                setError("");
              }}
            >
              Edit Profile
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Username
            </p>

            {isEditing ? (
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            ) : (
              <p className="font-medium">
                {user.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p className="font-medium">
              {user.email}
            </p>
          </div>

          {/* Verification */}
          <div>
            <p className="text-sm text-muted-foreground">
              Account Status
            </p>

            <p className="font-medium">
              {user.isVerified ? "Verified" : "Not verified"}
            </p>
          </div>

          {/* Joined */}
          <div>
            <p className="text-sm text-muted-foreground">
              Member Since
            </p>

            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Edit actions */}
          {isEditing && (
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="border-blue-950 bg-linear-to-br from-[#071A3D] via-[#0B2855] to-[#06142E] text-white shadow-xl mt-6 "
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Messages */}
          {message && (
            <p className="text-sm text-green-600">
              {message}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}