import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // Make sure this path and extension are correct
import "./index.css"; // Keep this for basic styling

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
