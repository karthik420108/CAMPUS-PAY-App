import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScanPayOverlay from "./ScanPayOverlay";
import "./ScanPay.css";

function ScanPay({ userId, f }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleScanSuccess = (scanData) => {
    // Close the scanner overlay first
    setOpen(false);
    
    // Navigate to payment page after overlay closes
    setTimeout(() => {
      navigate("/payment-mid", {
        state: {
          vendorId: scanData.vendorId,
          amount: scanData.amount,
          transactionId: scanData.transactionId,
          userId: scanData.userId,
        },
      });
    }, 300); // Wait for overlay to close
  };

  return (
    <>
      <div
        className={`scan-card ${f === true ? "disabled" : ""}`}
        onClick={() => {
          if (f === true) return;
          setOpen(true);
        }}
      >
        <div className="scan-icon">📷</div>
        <div>
          <h3>Scan & Pay</h3>
          <p>{f === true ? "Account Frozen" : "Scan QR to pay instantly"}</p>
        </div>
      </div>

      <ScanPayOverlay
        isOpen={open}
        onClose={() => setOpen(false)}
        userId={userId}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}

export default ScanPay;
