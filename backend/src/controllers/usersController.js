const pool = require("../config/db"); // Import the database connection pool

// Controller to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT user_id, name FROM users ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.stack);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Controller to get all products
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT product_id, name FROM products ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err.stack);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Controller to get all order types (Buy/Sell)
exports.getAllOrderTypes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT order_type_id, name FROM order_types ORDER BY order_type_id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching order types:", err.stack);
    res.status(500).json({ error: "Failed to fetch order types" });
  }
};
