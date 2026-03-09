import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/notifications")
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

//notification schema
const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  read: Boolean,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

app.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/notifications/mark-read", async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//socket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("sendNotification", (data) => {
    console.log("Notification sent:", data);
    try {
      const notification = new Notification(data);
      notification.save();
      io.emit("receivedNotification", notification);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
