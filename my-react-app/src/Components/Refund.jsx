import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Refund() {
  const { state } = useLocation();

  const { vendorId } = state || {};
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Step 1: Gmail + Amount, Step 2: MPIN
  const [gmail, setGmail] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [mpin, setMpin] = useState("");
  const [availableAmount, setAvailableAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available amount from backend
  useEffect(() => {
    if (!vendorId) return;

    const fetchAmount = async () => {
      try {
        const res = await axios.post(
          `http://localhost:5000/amount/${vendorId}`
        );
        console.log(res);
        setAvailableAmount(res.data.totalAmount || 0);
      } catch (err) {
        console.error(err);
      }
    };
    console.log(vendorId);
    fetchAmount();
  }, [vendorId]);

  // Step 1: Validate Gmail and Refund Amount
  const handleNext = () => {
    if (!gmail.includes("@")) {
      setMessage("Please enter a valid Gmail address.");
      return;
    }

    if (Number(refundAmount) <= 0) {
      setMessage("Refund amount must be greater than 0.");
      return;
    }

    if (Number(refundAmount) > availableAmount) {
      setMessage(
        `Refund amount cannot exceed available amount: ₹${availableAmount}`
      );
      return;
    }

    setMessage("");
    setStep(2); // Move to MPIN step
  };

  // Step 2: Submit MPIN
  const handleMpinSubmit = async (e) => {
    e.preventDefault();

    if (mpin.length !== 6 || !/^\d+$/.test(mpin)) {
      return setMessage("Enter valid 6-digit MPIN");
    }

    setLoading(true);
    setMessage("");
    try {
      // Frontend
      await axios.post("http://localhost:5000/refund", {
        vendorId, // matches backend
        amount: Number(refundAmount),
        mpin,
        email: gmail, // match the backend
      });

      navigate("/vendor-transaction", {state : {userId : vendorId , role : "vendor"}});
    } catch (err) {
      setMessage(err.response?.data?.msg || "Redeem failed");
    }
    setLoading(false);
  };

  // Forgot MPIN
  const forgotMpin = async () => {
    try {
      await axios.post("http://localhost:5000/send-mpin-otp", {
        userId: vendorId,
        role: "vendor",
      });
      navigate("/forgot-mpin", { state: { userId: vendorId, role: "vendor" } });
    } catch (err) {
      alert("Failed to send OTP");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      {step === 1 && (
        <>
          <h2>Refund Details</h2>
          <p>Available Amount: ₹{availableAmount}</p>
          <input
            type="email"
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
            placeholder="Enter your Gmail"
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          <input
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder="Enter refund amount"
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          <button onClick={handleNext} style={{ width: "100%" }}>
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Enter your MPIN</h2>
          <input
            type="password"
            value={mpin}
            onChange={(e) => setMpin(e.target.value)}
            maxLength={6}
            placeholder="6-digit MPIN"
            style={{ display: "block", marginBottom: "10px", width: "100%" }}
          />
          <button
            onClick={handleMpinSubmit}
            style={{ width: "100%", marginBottom: "10px" }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
          <button
            onClick={forgotMpin}
            style={{ width: "100%", backgroundColor: "#f0f0f0" }}
          >
            Forgot MPIN?
          </button>
        </>
      )}

      {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}
    </div>
  );
}

export default Refund;
