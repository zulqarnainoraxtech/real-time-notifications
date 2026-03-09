"use client";

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = "NotifyApp" }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Navbar connected to socket");
    });

    socket.on("receivedNotification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);

      // Show system notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(newNotification.title, {
          body: newNotification.message,
        });
      }
    });

    fetchNotifications();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("http://localhost:5000/notifications/mark-read", {
        method: "PUT",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="relative cursor-pointer group p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>

              {/* Notification Dropdown */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div
                    onClick={handleMarkAllRead}
                    className="bg-yellow-400 py-3 text-center cursor-pointer hover:bg-yellow-500 transition-colors font-semibold text-slate-800"
                  >
                    Mark All as Read
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {notifications.map((n, i) => (
                          <li
                            key={n._id || i}
                            className={`p-4 flex gap-3 items-start transition-colors hover:bg-slate-50 ${
                              !n.read ? "bg-blue-50/30" : ""
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-bold text-slate-900">
                                  {n.title}
                                </span>
                                <span className="text-slate-600">
                                  : {n.message}
                                </span>
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <a
              href="/admin"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Admin Panel
            </a>
          </div>

          <div className="md:hidden">
            <button className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
