const express = require("express");
const router = express.Router(); // router for manage all API sub-routes

// Import individual route modules
const userRoutes = require("./users"); // For user-related endpoints (e.g., fetching product names)
const ordersRoutes = require("./orders"); // For submitting and managing orders
const matchingRoutes = require("./matching"); // For triggering and displaying matching results

// Mount individual routers onto the main API router
router.use("/users", userRoutes);
router.use("/orders", ordersRoutes);
router.use("/matching", matchingRoutes);

// Optional: A simple API root endpoint to confirm it's working
router.get("/", (req, res) => {
  res.json({ message: "Welcome to the Order Matching System API!" });
});

module.exports = router;
