import React from "react";
import OrderForm from "./components/OrderForm.jsx";
import MatchingResults from "./components/MatchingResults.jsx"; // Import the new component

function App() {
  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          textAlign: "center",
          padding: "20px",
          backgroundColor: "#f0f0f0",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h1>Order Matching System</h1>
      </header>
      <main
        style={{
          padding: "20px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <OrderForm />
        <MatchingResults /> {/* Render the MatchingResults component here */}
      </main>
    </div>
  );
}

export default App;
