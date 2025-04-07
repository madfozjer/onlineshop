// server/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Load .env variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to parse JSON bodies

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running ✅" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Serve API routes (this can be more routes, like '/api/products', etc.)
app.get("/api/products", (req, res) => {
  res.json([{ id: 1, name: "Sample Product" }]);
});

// Serve the frontend during production
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDistPath)); // Serve the production build

  // Catch-all route for history mode
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
