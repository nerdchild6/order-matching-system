import React, { useState, useEffect } from "react";
import axios from "axios";

function MatchingResults() {
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setMessage("Fetching matching results...");
        const response = await axios.get("/api/matching");
        setMatches(response.data);
        if (response.data.length === 0) {
          setMessage("No matches found yet.");
        } else {
          setMessage("");
        }
      } catch (error) {
        console.error(
          "Error fetching matching results:",
          error.response ? error.response.data : error.message
        );
        setMessage("Failed to fetch matching results.");
      }
    };

    fetchMatches();

    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRunMatching = async () => {
    setMessage("Running matching algorithm...");
    try {
      const response = await axios.post("/api/matching/run");
      setMessage(response.data.message || "Matching algorithm executed.");
      const updatedMatchesResponse = await axios.get("/api/matching");
      setMatches(updatedMatchesResponse.data);
      if (updatedMatchesResponse.data.length === 0) {
        setMessage("Matching algorithm executed. No new matches found.");
      } else {
        setMessage("Matching algorithm executed. Displaying new matches.");
      }
    } catch (error) {
      console.error(
        "Error running matching algorithm:",
        error.response ? error.response.data : error.message
      );
      setMessage(
        `Error running matching algorithm: ${
          error.response ? error.response.data.error : "Server error."
        }`
      );
    }
  };

  return (
    <div
      style={{
        // maxWidth: "800px",
        // margin: "40px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Matching Results</h2>
      <button
        onClick={handleRunMatching}
        style={{
          padding: "10px 15px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      >
        Run Matching Algorithm
      </button>
      {message && (
        <p
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#e0f7fa",
            color: "#00796b",
            borderRadius: "4px",
            border: "1px solid #b2ebf2",
          }}
        >
          {message}
        </p>
      )}

      {matches.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={tableHeaderStyle}>Matching ID</th>
              <th style={tableHeaderStyle}>Seller</th>
              <th style={tableHeaderStyle}>Buyer</th>
              <th style={tableHeaderStyle}>Product</th>
              <th style={tableHeaderStyle}>Price</th>
              <th style={tableHeaderStyle}>Volume</th>
              <th style={tableHeaderStyle}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr
                key={match.matching_id}
                style={{ borderBottom: "1px solid #ddd" }}
              >
                <td style={tableCellStyle}>{match.matching_id}</td>
                <td style={tableCellStyle}>{match.seller_name}</td>
                <td style={tableCellStyle}>{match.buyer_name}</td>
                <td style={tableCellStyle}>{match.product_name}</td>
                {/* FIX IS HERE: Convert to float before toFixed() */}
                <td style={tableCellStyle}>
                  ${parseFloat(match.price).toFixed(2)}
                </td>
                <td style={tableCellStyle}>{match.volume} kg</td>
                <td style={tableCellStyle}>
                  {new Date(match.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          No matches to display. Submit some buy/sell orders and then click "Run
          Matching Algorithm".
        </p>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #eee",
};

export default MatchingResults;
