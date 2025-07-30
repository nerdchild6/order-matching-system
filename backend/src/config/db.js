const { Pool } = require("pg");

const pool = new Pool({
  user: "myappuser", // Using hardcoded values now
  host: "localhost",
  database: "order_matching_db",
  password: "mysecretpassword", // Make sure this matches your actual password
  port: 5432,
});

// Optional: Test the database connection when the application starts
pool
  .connect()
  .then((client) => {
    console.log("Successfully connected to PostgreSQL database!");
    client.release(); // Release the client back to the pool
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err.stack);
    // It's good practice to exit if database connection is critical for the app to function
    // process.exit(1);
  });

module.exports = pool;
