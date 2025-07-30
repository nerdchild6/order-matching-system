const path = require("path"); // Add this line
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") }); // Modify this line

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Backend API URL: http://localhost:${PORT}/api`);
});
