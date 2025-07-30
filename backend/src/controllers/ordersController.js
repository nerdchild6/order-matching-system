const pool = require("../config/db"); // Import the database connection pool

exports.submitOrder = async (req, res) => {
  const { userId, orderTypeId, productId, price, volume } = req.body;

  try {
    // Validate incoming data (basic example)
    if (!userId || !orderTypeId || !productId || !price || !volume) {
      return res.status(400).json({ error: "All order fields are required." });
    }

    // Insert the new order into the 'orders' table
    const result = await pool.query(
      "INSERT INTO orders (user_id, order_type_id, product_id, price, volume) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, orderTypeId, productId, price, volume]
    );

    res.status(201).json({
      message: "Order submitted successfully!",
      order: result.rows[0], // Return the newly created order
    });
  } catch (err) {
    console.error("Error submitting order:", err.stack);
    res.status(500).json({ error: "Failed to submit order." });
  }
};

// You might add other order-related controllers here later, e.g., getOrderById, cancelOrder, etc.
