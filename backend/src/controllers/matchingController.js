const pool = require("../config/db");

exports.runMatchingAlgorithm = async (req, res) => {
  try {
    await pool.query("BEGIN");

    // 1. Fetch all pending Buy orders (highest price, then oldest time, then largest volume)
    const buyOrdersResult = await pool.query(
      `SELECT * FROM orders
      WHERE order_type_id = (SELECT order_type_id FROM order_types WHERE name = 'Buy')
      AND volume > 0
      ORDER BY product_id ASC, price DESC, timestamp ASC, volume DESC;`
    );
    const buyOrders = buyOrdersResult.rows;

    // 2. Fetch all pending Sell orders (lowest price, then oldest time, then largest volume)
    const sellOrdersResult = await pool.query(
      `SELECT * FROM orders
      WHERE order_type_id = (SELECT order_type_id FROM order_types WHERE name = 'Sell')
      AND volume > 0
      ORDER BY product_id ASC, price ASC, timestamp ASC, volume DESC;`
    );
    const sellOrders = sellOrdersResult.rows;

    // Group orders by product_id for processing { product_id: [group_of_buy_orders], }
    const buyOrdersByProduct = buyOrders.reduce((acc, order) => {
      if (!acc[order.product_id]) {
        acc[order.product_id] = [];
      }
      acc[order.product_id].push(order);
      return acc;
    }, {});

    const sellOrdersByProduct = sellOrders.reduce((acc, order) => {
      if (!acc[order.product_id]) {
        acc[order.product_id] = [];
      }
      acc[order.product_id].push(order);
      return acc;
    }, {});

    const matches = [];
    const productIds = new Set([
      ...Object.keys(buyOrdersByProduct),
      ...Object.keys(sellOrdersByProduct),
    ]);

    // Iterate through each product and run the matching algorithm
    for (const productId of productIds) {
      const productBuyOrders = buyOrdersByProduct[productId] || []; // [{},{},]
      const productSellOrders = sellOrdersByProduct[productId] || [];

      let buyOrderIndex = 0;
      let sellOrderIndex = 0;

      // Iterate through each order in the product's group of buy and sell orders
      while (
        buyOrderIndex < productBuyOrders.length &&
        sellOrderIndex < productSellOrders.length
      ) {
        const buyOrder = productBuyOrders[buyOrderIndex]; // {order_id, user_id, product_id, price, volume, timestamp}
        const sellOrder = productSellOrders[sellOrderIndex];

        // Corrected: Convert price strings to numbers for a proper comparison
        const buyPrice = parseFloat(buyOrder.price);
        const sellPrice = parseFloat(sellOrder.price);

        // If the highest buy price is less than the lowest sell price, no more matches are possible for this product.
        if (buyPrice < sellPrice) {
          console.log(
            `[Product ${productId}] No price overlap. Breaking loop.`
          );
          break;
        }

        // A match is found. Calculate the trade volume and price.
        const tradeVolume = Math.min(
          parseFloat(buyOrder.volume),
          parseFloat(sellOrder.volume)
        );
        const tradePrice = buyPrice;

        if (tradeVolume > 0) {
          matches.push({
            seller_user_id: sellOrder.user_id,
            buyer_user_id: buyOrder.user_id,
            product_id: buyOrder.product_id,
            price: tradePrice,
            volume: tradeVolume,
          });

          console.log(`[Product ${productId}] Match found: `);
          console.log(
            `  Buy Order ID: ${buyOrder.order_id}, User: ${buyOrder.user_id}, Volume: ${buyOrder.volume}`
          );
          console.log(
            `  Sell Order ID: ${sellOrder.order_id}, User: ${sellOrder.user_id}, Volume: ${sellOrder.volume}`
          );
          console.log(
            `  Trade Volume: ${tradeVolume}, Trade Price: ${tradePrice}`
          );

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

          const newBuyVolume = parseFloat(buyOrder.volume) - tradeVolume;
          const newSellVolume = parseFloat(sellOrder.volume) - tradeVolume;

          await pool.query(
            "UPDATE orders SET volume = $1 WHERE order_id = $2",
            [newBuyVolume, buyOrder.order_id]
          );
          await pool.query(
            "UPDATE orders SET volume = $1 WHERE order_id = $2",
            [newSellVolume, sellOrder.order_id]
          );

          // Update the in-memory order objects to reflect the changes
          buyOrder.volume = newBuyVolume;
          sellOrder.volume = newSellVolume;
        }

        // Advance pointers based on which orders are fully filled
        if (parseFloat(buyOrder.volume) === 0) {
          buyOrderIndex++;
        }
        if (parseFloat(sellOrder.volume) === 0) {
          sellOrderIndex++;
        }
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
