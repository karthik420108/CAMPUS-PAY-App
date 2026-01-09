import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ScanPay.css";

function ScanPay({ userId, f }) {
  const navigate = useNavigate();

  const handleScanClick = () => {
    if (f === true) return;
    
    // Navigate to dedicated scanner page
    navigate("/scanner", { 
      state: { 
        userId: userId, 
        frozen: f 
      } 
    });
  };

  return (
    <div
      className={`scan-card ${f === true ? "disabled" : ""}`}
      onClick={handleScanClick}
    >
      <div className="scan-icon">📷</div>
      <div>
        <h3>Scan & Pay</h3>
        <p>{f === true ? "Account Frozen" : "Scan QR to pay instantly"}</p>
      </div>
    </div>
  );
}

export default ScanPay;
