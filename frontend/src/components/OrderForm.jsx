import React, { useState, useEffect } from "react";
import axios from "axios"; // We'll install axios in the next step

function OrderForm() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedOrderTypeId, setSelectedOrderTypeId] = useState("");
  const [price, setPrice] = useState("");
  const [volume, setVolume] = useState("");
  const [message, setMessage] = useState(""); // For success/error messages

  // Fetch data for dropdowns when the component mounts
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch users
        const usersResponse = await axios.get("/api/form/users");
        setUsers(usersResponse.data);

        // Fetch products
        const productsResponse = await axios.get("/api/form/products");
        setProducts(productsResponse.data);

        // Fetch order types (Buy/Sell)
        const orderTypesResponse = await axios.get("/api/form/order-types");
        setOrderTypes(orderTypesResponse.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        setMessage("Failed to load form data.");
      }
    };

    fetchDropdownData();
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    setMessage(""); // Clear previous messages

    // Basic client-side validation
    if (
      !selectedUserId ||
      !selectedProductId ||
      !selectedOrderTypeId ||
      price === "" ||
      volume === ""
    ) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (parseFloat(price) <= 0 || parseInt(volume) <= 0) {
      setMessage("Price and Volume must be positive values.");
      return;
    }

    try {
      const orderData = {
        userId: parseInt(selectedUserId),
        orderTypeId: parseInt(selectedOrderTypeId),
        productId: parseInt(selectedProductId),
        price: parseFloat(price),
        volume: parseInt(volume),
      };

      const response = await axios.post("/api/orders", orderData);
      setMessage(response.data.message); // Display success message from backend

      // Clear form fields after successful submission
      setSelectedUserId("");
      setSelectedProductId("");
      setSelectedOrderTypeId("");
      setPrice("");
      setVolume("");
    } catch (error) {
      console.error(
        "Error submitting order:",
        error.response ? error.response.data : error.message
      );
      setMessage(
        `Error: ${
          error.response
            ? error.response.data.error
            : "Failed to connect to server."
        }`
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Submit New Order</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="user"
            style={{ display: "block", marginBottom: "5px" }}
          >
            User:
          </label>
          <select
            id="user"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="orderType"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Order Type:
          </label>
          <select
            id="orderType"
            value={selectedOrderTypeId}
            onChange={(e) => setSelectedOrderTypeId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <option value="">Select Order Type</option>
            {orderTypes.map((type) => (
              <option key={type.order_type_id} value={type.order_type_id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="product"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Product:
          </label>
          <select
            id="product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.product_id} value={product.product_id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="price"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Price:
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01" // Allows decimal prices
            min="0.01"
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="volume"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Volume:
          </label>
          <input
            type="number"
            id="volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            min="1"
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Submit Order
        </button>
        {message && (
          <p
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#74ec67ff",
              color: "#178125ff",
              borderRadius: "4px",
              border: "1px solid #f5c6cb",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default OrderForm;
