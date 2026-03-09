"use client";

import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

const AdminPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("general");
  const [rooms, setRooms] = useState<string[]>([]);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  useEffect(() => {
    // Initialize socket connection
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    // Fetch available rooms
    fetch("http://localhost:5000/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        if (data.length > 0) setRoom(data[0]);
      })
      .catch((err) => console.error("Error fetching rooms:", err));

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSendNotification = () => {
    if (!title || !message) {
      alert("Please fill in both title and message");
      return;
    }

    setStatus("sending");

    const notificationData = {
      title,
      message,
      room,
      read: false,
    };

    socket.emit("sendNotification", notificationData);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setStatus("success");
      setTitle("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 500);
  };

  // Room label colors for visual distinction
  const roomColors: Record<string, string> = {
    general: "bg-slate-100 text-slate-700 border-slate-200",
    sports: "bg-emerald-50 text-emerald-700 border-emerald-200",
    news: "bg-blue-50 text-blue-700 border-blue-200",
    deals: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center text-slate-800 mb-8 tracking-tight">
            Admin Panel
          </h1>

          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-slate-600 ml-1"
              >
                Notification Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. 50% Off Flash Sale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-slate-600 ml-1"
              >
                Message Content
              </label>
              <textarea
                id="message"
                placeholder="Enter your notification message here..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-700 resize-none"
              />
            </div>

            {/* Room Selector */}
            <div className="space-y-2">
              <label
                htmlFor="room"
                className="text-sm font-medium text-slate-600 ml-1"
              >
                Target Room
              </label>
              <div className="flex flex-wrap gap-2 mt-3">
                {rooms.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoom(r)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                      room === r
                        ? "ring-2 ring-blue-500 ring-offset-1 shadow-sm " +
                          (roomColors[r] ||
                            "bg-slate-100 text-slate-700 border-slate-200")
                        : roomColors[r] ||
                          "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSendNotification}
              disabled={status === "sending"}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                status === "success"
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                  : status === "sending"
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
              }`}
            >
              {status === "sending" ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : status === "success" ? (
                "Notification Sent!"
              ) : (
                `Send to #${room}`
              )}
            </button>

            {status === "success" && (
              <p className="text-center text-sm text-emerald-600 font-medium animate-bounce mt-2">
                Successfully sent to <span className="font-bold">#{room}</span>{" "}
                room
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
