const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController"); // Import the controller

// Route to get all users
router.get("/", usersController.getAllUsers);

// Route to get all products
router.get("/products", usersController.getAllProducts);

// Route to get all order types (Buy/Sell)
router.get("/order-types", usersController.getAllOrderTypes);

module.exports = router;
