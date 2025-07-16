import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import api from "./api.js"; // Assuming this file exists and exports an Express router or function
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies from incoming requests

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("📦 Connected to MongoDB"))
  .catch((err) =>
    console.error("❌ Could not connect to MongoDB:", err.message)
  );

api(app, process.env.MONGODB_URI);

// This block ensures that your production build of the client-side application
// is served correctly when the server is running in a production environment.
if (process.env.NODE_ENV === "production") {
  // Get the current file's path and directory name for ES Modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const clientDistPath = path.join(__dirname, process.env.DIST_LOCATION);

  app.use(express.static(clientDistPath));

  app.get("/*path", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on ${PORT}`);
});
