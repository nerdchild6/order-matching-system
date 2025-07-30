const express = require("express");
const cors = require("cors"); // Required for frontend to communicate with backend
const apiRouter = require("./routes/api"); // Import your main API router

const app = express();

// Middleware
// Enable CORS for all origins (for development, restrict in production)
app.use(cors());

// Body parser middleware to parse JSON request bodies
app.use(express.json());

// Mount the main API router
app.use("/api", apiRouter);

// Basic route for testing server status
app.get("/", (req, res) => {
  res.send("Order Matching Backend API is running!");
});

// Error handling middleware (optional, but good for robust apps)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
