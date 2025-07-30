const pool = require("../config/db");

exports.runMatchingAlgorithm = async (req, res) => {
  try {
    // Start a transaction for atomicity
    await pool.query("BEGIN");

    // 1. Fetch all pending Buy orders (highest price, then oldest time, then largest volume)
    const buyOrdersResult = await pool.query(
      `SELECT * FROM orders
             WHERE order_type_id = (SELECT order_type_id FROM order_types WHERE name = 'Buy')
             AND volume > 0 -- Only consider orders with remaining volume
             ORDER BY price DESC, timestamp ASC, volume DESC;` // ADDED: volume DESC
    );
    const buyOrders = buyOrdersResult.rows;

    // 2. Fetch all pending Sell orders (lowest price, then oldest time, then largest volume)
    const sellOrdersResult = await pool.query(
      `SELECT * FROM orders
             WHERE order_type_id = (SELECT order_type_id FROM order_types WHERE name = 'Sell')
             AND volume > 0 -- Only consider orders with remaining volume
             ORDER BY price ASC, timestamp ASC, volume DESC;` // ADDED: volume DESC
    );
    const sellOrders = sellOrdersResult.rows;

    const matches = [];

    // Price-Time-Volume matching algorithm
    for (const buyOrder of buyOrders) {
      for (const sellOrder of sellOrders) {
        // Check if orders are for the same product and can be matched by price
        if (
          buyOrder.product_id === sellOrder.product_id &&
          buyOrder.price >= sellOrder.price
        ) {
          const tradeVolume = Math.min(buyOrder.volume, sellOrder.volume);
          // For simplicity, assume trade happens at buy order's price if matching
          // In a real system, trade price logic can be more complex (e.g., midpoint, aggressor price, etc.)
          const tradePrice = buyOrder.price;

          // Record the match
          matches.push({
            seller_user_id: sellOrder.user_id,
            buyer_user_id: buyOrder.user_id,
            product_id: buyOrder.product_id,
            price: tradePrice,
            volume: tradeVolume,
          });

          // Update remaining volumes for the matched orders
          buyOrder.volume -= tradeVolume;
          sellOrder.volume -= tradeVolume;

          // Update orders in the database
          await pool.query(
            "UPDATE orders SET volume = $1 WHERE order_id = $2",
            [buyOrder.volume, buyOrder.order_id]
          );
          await pool.query(
            "UPDATE orders SET volume = $1 WHERE order_id = $2",
            [sellOrder.volume, sellOrder.order_id]
          );

          // Insert match into matchings table
          await pool.query(
            `INSERT INTO matchings (seller_user_id, buyer_user_id, product_id, price, volume)
                         VALUES ($1, $2, $3, $4, $5)`,
            [
              sellOrder.user_id,
              buyOrder.user_id,
              buyOrder.product_id,
              tradePrice,
              tradeVolume,
            ]
          );

          // If a buy or sell order is fully filled, stop processing it
          if (buyOrder.volume === 0) break; // Move to next buy order
          if (sellOrder.volume === 0) continue; // Move to next sell order with current buy order
        }
      }
    }

    await pool.query("COMMIT"); // Commit the transaction
    res.status(200).json({
      message: "Matching algorithm executed successfully!",
      matches: matches,
    });
  } catch (err) {
    await pool.query("ROLLBACK"); // Rollback on error
    console.error("Error running matching algorithm:", err.stack);
    res.status(500).json({ error: "Failed to run matching algorithm." });
  }
};

exports.getMatchingResults = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                m.matching_id,
                s.name AS seller_name,
                b.name AS buyer_name,
                p.name AS product_name,
                m.price,
                m.volume,
                m.timestamp
            FROM matchings m
            JOIN users s ON m.seller_user_id = s.user_id
            JOIN users b ON m.buyer_user_id = b.user_id
            JOIN products p ON m.product_id = p.product_id
            ORDER BY m.timestamp DESC;
        `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching matching results:", err.stack);
    res.status(500).json({ error: "Failed to fetch matching results." });
  }
};
