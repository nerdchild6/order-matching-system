const { Pool } = require("pg");

const pool = new Pool({
  user: "myappuser",
  host: "localhost",
  database: "order_matching_db",
  password: "mysecretpassword",
  port: 5432,
});

async function debugMatching() {
  try {
    console.log("=== Debugging Matching Algorithm ===\n");

    // 1. Check if the orders exist
    console.log("1. Checking if orders exist:");
    const ordersResult = await pool.query("SELECT * FROM orders ORDER BY order_id DESC LIMIT 5");
    console.log("Orders in database:", ordersResult.rows);
    console.log();

    // 2. Check order_types table
    console.log("2. Checking order_types:");
    const orderTypesResult = await pool.query("SELECT * FROM order_types");
    console.log("Order types:", orderTypesResult.rows);
    console.log();

    // 3. Test the buy orders query
    console.log("3. Testing buy orders query:");
    const buyOrdersResult = await pool.query(
      `SELECT * FROM orders
      WHERE order_type_id = (SELECT order_type_id FROM order_types WHERE name = 'Buy')
      AND volume > 0
      ORDER BY product_id ASC, price DESC, timestamp ASC, volume DESC;`
    );
    console.log("Buy orders found:", buyOrdersResult.rows);
    console.log();

    // 4. Test the sell orders query
    console.log("4. Testing sell orders query:");
    const sellOrdersResult = await pool.query(
      `SELECT * FROM orders
      WHERE order_type_id = (SELECT order_type_id FROM order_types WHERE name = 'Sell')
      AND volume > 0
      ORDER BY product_id ASC, price ASC, timestamp ASC, volume DESC;`
    );
    console.log("Sell orders found:", sellOrdersResult.rows);
    console.log();

    // 5. Check if there are any matches in the matchings table
    console.log("5. Checking existing matches:");
    const matchesResult = await pool.query("SELECT * FROM matchings ORDER BY matching_id DESC LIMIT 5");
    console.log("Existing matches:", matchesResult.rows);
    console.log();

    // 6. Test the matching logic manually
    if (buyOrdersResult.rows.length > 0 && sellOrdersResult.rows.length > 0) {
      console.log("6. Manual matching test:");
      const buyOrder = buyOrdersResult.rows[0];
      const sellOrder = sellOrdersResult.rows[0];
      
      console.log("Buy order:", buyOrder);
      console.log("Sell order:", sellOrder);
      console.log(`Buy price (${buyOrder.price}) > Sell price (${sellOrder.price}): ${buyOrder.price > sellOrder.price}`);
      console.log(`Same product_id: ${buyOrder.product_id === sellOrder.product_id}`);
      console.log(`Buy volume > 0: ${buyOrder.volume > 0}`);
      console.log(`Sell volume > 0: ${sellOrder.volume > 0}`);
    }

  } catch (err) {
    console.error("Error:", err.stack);
  } finally {
    await pool.end();
  }
}

debugMatching(); 