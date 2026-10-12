"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Bell,
  ArrowLeftRight,
  Wallet,
  Landmark,
  ShieldCheck,
} from "lucide-react";

interface DashboardHeaderProps {
  username: string;
}

export default function DashboardHeader({
  username,
}: DashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const initial = username.charAt(0).toUpperCase();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <ArrowLeftRight className="h-4 w-4" />;

      case "deposit":
        return <Wallet className="h-4 w-4" />;

      case "withdrawal":
        return <Landmark className="h-4 w-4" />;

      case "security":
        return <ShieldCheck className="h-4 w-4" />;

      case "system":
      default:
        return <Bell className="h-4 w-4" />;
    }
};

    const getRelativeTime = (date: string) => {
      const now = new Date();
      const createdAt = new Date(date);

      const differenceInSeconds = Math.floor(
        (now.getTime() - createdAt.getTime()) / 1000
      );

      if (differenceInSeconds < 60) {
        return "Just now";
      }

      const differenceInMinutes = Math.floor(
        differenceInSeconds / 60
      );

      if (differenceInMinutes < 60) {
        return `${differenceInMinutes} ${
          differenceInMinutes === 1 ? "minute" : "minutes"
        } ago`;
      }

      const differenceInHours = Math.floor(
        differenceInMinutes / 60
      );

      if (differenceInHours < 24) {
        return `${differenceInHours} ${
          differenceInHours === 1 ? "hour" : "hours"
        } ago`;
      }

      const differenceInDays = Math.floor(
        differenceInHours / 24
      );

      if (differenceInDays === 1) {
        return "Yesterday";
      }

      if (differenceInDays < 7) {
        return `${differenceInDays} days ago`;
      }

      return createdAt.toLocaleDateString();
    };
      



  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications");

        const data = await response.json();

        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error(
          "Failed to fetch notifications:",
          error
        );
      }
    };

    fetchNotifications();
  }, []);

  // Mark one notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotifications((currentNotifications) =>
          currentNotifications.map((notification) =>
            notification._id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );

        setUnreadCount((currentCount) =>
          Math.max(currentCount - 1, 0)
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        "/api/notifications/mark-all-read",
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotifications((currentNotifications) =>
          currentNotifications.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );

        setUnreadCount(0);
      }
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  return (
    <header className="flex items-center justify-between border-b p-4">
      {/* Left side */}
      <div>
        <h1 className="text-xl font-semibold">
          Finova
        </h1>

        <p className="text-sm text-muted-foreground">
          Your digital wallet
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* =========================
            NOTIFICATION
        ========================== */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            onClick={() =>
              setIsNotificationOpen(
                !isNotificationOpen
              )
            }
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5" />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </Button>

          {/* Notification dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-background shadow-lg">

              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold">
                  Notifications
                </h2>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications list */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification._id);
                        }
                      }}
                      className={`cursor-pointer border-b px-4 py-3 last:border-b-0 transition-colors hover:bg-muted ${
                        !notification.isRead ? "bg-muted/50" : "bg-background"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-muted p-2">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {notification.title}
                            </p>

                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {notification.message}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {getRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================
            ACCOUNT
        ========================== */}
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

          {/* Account dropdown */}
          {isOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-background p-2 shadow-lg">

              {/* Account information */}
              <div className="border-b px-3 py-2">
                <p className="text-sm font-medium">
                  {username}
                </p>

                <p className="text-xs text-muted-foreground">
                  Finova Account
                </p>
              </div>

              {/* Account links */}
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
                    console.log(
                      "Logout clicked"
                    );
                  }}
                >
                  Logout
                </button>

              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}



