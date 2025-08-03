const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/ordersController"); // Import the controller

// Route to submit a new order
router.post("/", ordersController.submitOrder);

module.exports = router;
