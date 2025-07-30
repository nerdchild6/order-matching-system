const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/ordersController"); // Import the controller

// Route to submit a new order
router.post("/", ordersController.submitOrder);

// You might add other order-related routes here later, e.g.,
// router.get('/', ordersController.getAllOrders);
// router.get('/:id', ordersController.getOrderById);

module.exports = router;
