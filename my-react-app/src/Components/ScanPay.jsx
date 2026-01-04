import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import "./ScanPay.css";
import axios from "axios";

function ScanPay({ userId, f }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || f) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    let scanned = false; // 🔒 prevent multiple scans

    scanner.render(
      async (decodedText) => {
        if (scanned) return;
        scanned = true;

        try {
          // 1️⃣ Must start with Campuspay::
          if (!decodedText.startsWith('Campuspay::"')) {
            throw new Error("Not a CampusPay QR");
          }

          // 2️⃣ Extract payload inside quotes
          const payloadMatch = decodedText.match(/Campuspay::"(.*)"/);
          if (!payloadMatch) throw new Error("Invalid QR structure");

          const payload = payloadMatch[1];

          // 3️⃣ Split by comma
          const parts = payload.split(",");
          const vendorId = parts[0]?.trim();
          const amount = parts[1]?.split(":")[1]?.trim();
          const tid = parts[2]?.split(":")[1]?.trim();

          if (!vendorId) throw new Error("Missing vendorId in QR");

          // 4️⃣ Optional: verify QR in backend
          if (tid) {
            const verifyRes = await axios.post(
              "http://localhost:5000/transaction/verify-qr",
              { txid: tid  }
            );

            if (!verifyRes.data.valid) {
              throw new Error("QR verification failed");
            }
          }

          
          // 5️⃣ Stop scanner
          await scanner.clear();
          setOpen(false);

          // 6️⃣ Navigate to payment page
          navigate("/payment-mid", {
            state: {
              vendorId,
              amount,
              transactionId: tid,
              userId,
              
            },
          });
        } catch (err) {
          setError(err.response?.data?.error || err.message);
          // allow retry
          scanned = false;
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [open, f, navigate, userId]);

  return (
    <>
      {/* SCAN CARD */}
      <div
        className={`scan-card ${f ? "disabled" : ""}`}
        onClick={() => {
          if (f) return;
          setError("");
          setOpen(true);
        }}
      >
        <div className="scan-icon">📷</div>
        <div>
          <h3>Scan & Pay</h3>
          <p>{f ? "Account Frozen" : "Scan QR to pay instantly"}</p>
        </div>
      </div>

      {/* SCANNER OVERLAY */}
      {open && !f && (
        <div className="scanner-overlay">
          <div className="scanner-box">
            <h3>Scan QR Code</h3>
            <div id="qr-reader" />
            {error && <p className="scan-error">{error}</p>}
            <button className="close-btn" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ScanPay;
