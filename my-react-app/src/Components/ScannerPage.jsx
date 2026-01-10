import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "motion/react";
import axios from "axios";
import "./ScannerPage.css";
import API_CONFIG from "../config/api";

function ScannerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, frozen } = location.state || {};

  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const scannerRef = useRef(null);

  const toggleTorch = async () => {
    try {
      const scanner = scannerRef.current;
      if (!scanner) return;

      const caps = scanner.getRunningTrackCameraCapabilities?.();
      if (!caps || !caps.torchFeature) return;

      const torch = caps.torchFeature();
      const current = torch.value();
      await torch.apply(!current);
      setTorchOn(!current);
    } catch (err) {
      console.error("Torch toggle failed:", err);
      setError("Torch control not available on this device/browser");
    }
  };

  const initializeScanner = () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader-page");
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 320, height: 320 },
        aspectRatio: 1.0,
      };

      html5QrCode
        .start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            try {
              if (!decodedText.startsWith('Campuspay::"')) {
                throw new Error("Not a CampusPay QR");
              }

              const payloadMatch = decodedText.match(/Campuspay::"(.*)"/);
              if (!payloadMatch) throw new Error("Invalid QR structure");

              const payload = payloadMatch[1];
              const parts = payload.split(",");
              const vendorId = parts[0]?.trim();
              const amount = parts[1]?.split(":")[1]?.trim();
              const tid = parts[2]?.split(":")[1]?.trim();

              if (!vendorId) throw new Error("Missing vendorId in QR");

              if (tid) {
                const verifyRes = await axios.post(
                  API_CONFIG.getUrl("/transaction/verify-qr"),
                  { txid: tid }
                );

                if (!verifyRes.data.valid) {
                  if (verifyRes.data.error?.includes("already")) {
                    throw new Error("Payment already done for this QR code");
                  } else if (verifyRes.data.error?.includes("expired")) {
                    throw new Error("QR code has expired");
                  } else if (verifyRes.data.error?.includes("not found")) {
                    throw new Error("Invalid QR code");
                  } else {
                    throw new Error(
                      verifyRes.data.error || "QR verification failed"
                    );
                  }
                }
              } else {
                throw new Error("Invalid QR code format");
              }

              await html5QrCode.stop();
              scannerRef.current = null;
              setIsScanning(false);
              setIsInitializing(false);

              navigate("/payment-mid", {
                state: {
                  vendorId,
                  amount,
                  transactionId: tid,
                  userId,
                },
              });
            } catch (err) {
              console.error("Scan error:", err);
              setError(err.response?.data?.error || err.message);
              setIsInitializing(false);
            }
          },
          (errorMessage) => {
            console.error("Scan error:", errorMessage);

            if (
              errorMessage.includes("No QR code found") ||
              errorMessage.includes("QR code not found") ||
              errorMessage.includes("No barcode") ||
              errorMessage.includes("Finder pattern") ||
              errorMessage.includes("Couldn't find enough") ||
              errorMessage.includes("MultiFormatReader") ||
              errorMessage.includes("NotFoundException")
            ) {
              return;
            }

            if (
              errorMessage.includes("Permission denied") ||
              errorMessage.includes("NotAllowedError") ||
              errorMessage.includes("NotFoundError") ||
              errorMessage.includes("NotReadableError") ||
              errorMessage.includes("Camera") ||
              errorMessage.includes("Device")
            ) {
              setError("Camera access denied or not available");
              setIsInitializing(false);
            }
          }
        )
        .then(() => {
          setIsScanning(true);
          setIsInitializing(false);
          setError("");

          try {
            const caps = html5QrCode.getRunningTrackCameraCapabilities?.();
            if (caps && caps.torchFeature) {
              const torch = caps.torchFeature();
              setTorchSupported(!!torch);
              setTorchOn(torch?.value?.() || false);
            } else {
              setTorchSupported(false);
            }
          } catch (e) {
            console.warn("Torch capability check failed:", e);
            setTorchSupported(false);
          }
        })
        .catch((err) => {
          console.error("Failed to start scanner:", err);
          setError(`Failed to start scanner: ${err.message || "Unknown error"}`);
          setIsScanning(false);
          setIsInitializing(false);
        });
    } catch (scannerErr) {
      console.error("Scanner initialization error:", scannerErr);
      setError(
        `Failed to initialize scanner: ${
          scannerErr.message || "Unknown error"
        }`
      );
      setIsScanning(false);
      setIsInitializing(false);
    }
  };

  const stopScanner = async () => {
    try {
      setIsStopping(true);

      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }

      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        const stream = video.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
          video.srcObject = null;
        }
      });

      const qrReaderElement = document.getElementById("qr-reader-page");
      if (qrReaderElement) {
        qrReaderElement.innerHTML = "";
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
    } finally {
      setIsScanning(false);
      setIsInitializing(false);
      setIsStopping(false);
      setTorchSupported(false);
      setTorchOn(false);
    }
  };

  useEffect(() => {
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecureContext) {
      setError("Camera access requires HTTPS or localhost. Please use a secure connection.");
      return;
    }

    // Don't auto-start camera - wait for user to click button
    setIsScanning(false);
    setIsInitializing(false);
    setError("");

    const initializeCamera = async () => {
      try {
        // Check if browser supports mediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser. Please try using a modern browser like Chrome, Firefox, or Safari.");
        }

        // Request camera permission immediately
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        // Stop the stream after getting permission
        stream.getTracks().forEach((track) => track.stop());

        // Set camera as ready after successful permission
        setTimeout(() => {
          setIsInitializing(false);
          setError("");
          setCameraReady(true);
        }, 100);

      } catch (permissionErr) {
        console.error("Camera permission error:", permissionErr);
        setIsInitializing(false);
        setIsScanning(false);
        
        if (permissionErr.name === "NotAllowedError") {
          setError(
            "Camera access denied. Please allow camera permissions and try again."
          );
        } else if (permissionErr.name === "NotFoundError") {
          setError("No camera found. Please connect a camera and try again.");
        } else if (permissionErr.name === "NotReadableError") {
          setError("Camera is already in use by another application.");
        } else if (permissionErr.message && permissionErr.message.includes("getUserMedia")) {
          setError("Camera API not available. Please ensure you're using HTTPS or localhost.");
        } else {
          setError(
            `Camera error: ${permissionErr.message || "Unknown error"}`
          );
        }
      }
    };

    // Set a timeout for initialization
    const initTimeout = setTimeout(() => {
      if (isInitializing) {
        setError(
          "Camera initialization timed out. Please check camera permissions and try again."
        );
        setIsInitializing(false);
        setIsScanning(false);
      }
    }, 10000); // Increased timeout to 10 seconds

    // Don't initialize camera immediately - wait for user to click button
    // initializeCamera();

    return () => {
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      stopScanner();
    };
  }, [userId, frozen, navigate]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      stopScanner();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleCancel = async () => {
    await stopScanner();
    navigate(-1);
  };

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <h2 className="scan-title">Scan & Pay</h2>
        <p className="scan-subtitle">Position QR code within the frame</p>
      </div>

      <div className="scanner-container">
        <div className="scanner-frame">
          <div className="scanner-corners">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
          </div>
          <div className="scan-line"></div>
          <div id="qr-reader-page" />

          {torchSupported && (
            <button
              className={`torch-btn ${torchOn ? "torch-on" : ""}`}
              onClick={toggleTorch}
              disabled={!isScanning || isInitializing}
            >
              {torchOn ? "Turn Torch Off" : "Turn Torch On"}
            </button>
          )}

          {!cameraReady && !isInitializing && (
            <div className="camera-prompt">
              <div className="camera-prompt-content">
                <div className="camera-icon">📷</div>
                <div className="camera-prompt-text">
                  <h3>Camera Access Required</h3>
                  <p>Click the button below to enable your camera for QR scanning</p>
                </div>
              </div>
              <button
                className="start-camera-btn"
                onClick={() => {
                  setIsInitializing(true);
                  initializeCamera();
                }}
                disabled={isInitializing}
              >
                {isInitializing ? "Requesting Camera Access..." : "Start Camera"}
              </button>
            </div>
          )}

          {isInitializing && (
            <div className="scanner-loading">
              <div className="loading-spinner"></div>
              <p>Initializing camera...</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          className="scan-error-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="scan-error-text">⚠️ {error}</p>
        </motion.div>
      )}

      <div className="scan-instructions">
        <div className="instruction-item">
          <span className="instruction-icon">📷</span>
          <span>Allow camera access when prompted</span>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon">📱</span>
          <span>Hold your device steady</span>
        </div>
        <div className="instruction-item">
          <span className="instruction-icon">🎯</span>
          <span>Keep QR code within the frame</span>
        </div>
      </div>

      <div className="scan-footer">
        <motion.button
          className="cancel-scan-btn"
          onClick={handleCancel}
          whileHover={{ scale: isStopping ? 1 : 1.02 }}
          whileTap={{ scale: isStopping ? 1 : 0.98 }}
          disabled={isStopping}
        >
          {isStopping ? "Stopping..." : "Cancel"}
        </motion.button>
      </div>
    </div>
  );
}

export default ScannerPage;
