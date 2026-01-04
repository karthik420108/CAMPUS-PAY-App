import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";

export default function AddFunds() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [am , setam] = useState("")

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/"); // redirect if not admin
    }
    const fb = async()=>{
        const res = await axios.post("http://localhost:5000/institute-balance")
        setam(res.data.balance)
    }
    fb()
  }, [state, navigate]);

  const fb = async()=>{
        const res = await axios.post("http://localhost:5000/institute-balance")
        setam(res.data.balance)
    }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/add-institute-funds", {
        amount: Number(amount),
      });

      if (res.data.success) {
        setMessage(`Successfully added ₹${amount} to institute balance.`);
        setAmount("");
        fb(res.data.newBalance)
        
      } else {
        setMessage("Failed to add funds. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <>
      <Header 
        title="Add Institute Funds" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
      <h2>Add Funds</h2>
      <h3>Available Amount : {am}</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Amount (₹):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ marginLeft: "10px", width: "100%" }}
            min="1"
          />
        </label>
        <button type="submit" disabled={loading} style={{ marginTop: "10px" }}>
          {loading ? "Adding..." : "Add Funds"}
        </button>
      </form>
      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    </>
  );
}
