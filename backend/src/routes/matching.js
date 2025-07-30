const express = require("express");
const router = express.Router();
const matchingController = require("../controllers/matchingController"); // Import the controller

// Route to trigger the order matching algorithm
router.post("/run", matchingController.runMatchingAlgorithm);

// Route to get all matching results
router.get("/", matchingController.getMatchingResults);

module.exports = router;
