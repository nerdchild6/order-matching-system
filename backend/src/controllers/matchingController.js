const pool = require("../config/db");

exports.runMatchingAlgorithm = async (req, res) => {
  try {
    await pool.query("BEGIN");

    // 1. Fetch all pending Buy orders (highest price, then oldest time, then largest volume)
    const buyOrdersResult = await pool.query(
      `SELECT * FROM orders
             WHERE order_type_id = (SELECT order_type_id FROM order_types WHERE name = 'Buy')
             AND volume > 0
             ORDER BY price DESC, timestamp ASC, volume DESC;`
    );
    const buyOrders = buyOrdersResult.rows;

    // 2. Fetch all pending Sell orders (lowest price, then oldest time, then largest volume)
    const sellOrdersResult = await pool.query(
      `SELECT * FROM orders
             WHERE order_type_id = (SELECT order_type_id FROM order_types WHERE name = 'Sell')
             AND volume > 0
             ORDER BY price ASC, timestamp ASC, volume DESC;`
    );
    const sellOrders = sellOrdersResult.rows;

    const matches = [];

    // Corrected Price-Time-Volume matching algorithm
    let buyOrderIndex = 0;
    let sellOrderIndex = 0;

    while (
      buyOrderIndex < buyOrders.length &&
      sellOrderIndex < sellOrders.length
    ) {
      const buyOrder = buyOrders[buyOrderIndex];
      const sellOrder = sellOrders[sellOrderIndex];

      // Ensure orders are for the same product
      if (buyOrder.product_id !== sellOrder.product_id) {
        sellOrderIndex++; // Move to next sell order if products don't match
        continue;
      }

      // Check if prices overlap for a match
      if (buyOrder.price >= sellOrder.price) {
        const tradeVolume = Math.min(buyOrder.volume, sellOrder.volume);

        // Check to ensure we are not trading a volume of 0
        if (tradeVolume > 0) {
          const tradePrice = buyOrder.price;

          // 1. Record the match in memory
          matches.push({
            seller_user_id: sellOrder.user_id,
            buyer_user_id: buyOrder.user_id,
            product_id: buyOrder.product_id,
            price: tradePrice,
            volume: tradeVolume,
          });

          // 2. Insert match into matchings table
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

          // 3. Update remaining volumes for the matched orders in the database
          const newBuyVolume = buyOrder.volume - tradeVolume;
          const newSellVolume = sellOrder.volume - tradeVolume;

          await pool.query(
            "UPDATE orders SET volume = $1 WHERE order_id = $2",
            [newBuyVolume, buyOrder.order_id]
          );
          await pool.query(
            "UPDATE orders SET volume = $1 WHERE order_id = $2",
            [newSellVolume, sellOrder.order_id]
          );

          // 4. Update the in-memory order objects to reflect the changes
          buyOrder.volume = newBuyVolume;
          sellOrder.volume = newSellVolume;
        }

        // 5. Move to the next orders if they are fully filled
        if (buyOrder.volume === 0) {
          buyOrderIndex++;
        }
        if (sellOrder.volume === 0) {
          sellOrderIndex++;
        }
      } else {
        // No match possible with this buy order, move to the next one
        buyOrderIndex++;
      }
    }

    await pool.query("COMMIT");
    res.status(200).json({
      message: "Matching algorithm executed successfully!",
      matches: matches,
    });
  } catch (err) {
    await pool.query("ROLLBACK");
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
