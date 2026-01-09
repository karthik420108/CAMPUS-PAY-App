import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "motion/react";
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
  
  // Move scanner to component level scope
  const scannerRef = useRef(null);

  // Define initializeScanner at component level scope
  const initializeScanner = () => {
    try {
      // Create Html5Qrcode instance for direct video control
      const html5QrCode = new Html5Qrcode("qr-reader-page");
      
      // Update the scanner ref
      scannerRef.current = html5QrCode;

      // Configuration for scanning
      const config = { 
        fps: 15,
        qrbox: { width: 320, height: 320 },
        aspectRatio: 1.0
      };

      // Start scanning
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText, resultObject) => {
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

            // 4️⃣ Verify QR in backend (mandatory for security)
            if (tid) {
              const verifyRes = await axios.post(
                API_CONFIG.getUrl("/transaction/verify-qr"),
                { txid: tid }
              );

              if (!verifyRes.data.valid) {
                // Handle different error scenarios
                if (verifyRes.data.error?.includes('already')) {
                  throw new Error("Payment already done for this QR code");
                } else if (verifyRes.data.error?.includes('expired')) {
                  throw new Error("QR code has expired");
                } else if (verifyRes.data.error?.includes('not found')) {
                  throw new Error("Invalid QR code");
                } else {
                  throw new Error(verifyRes.data.error || "QR verification failed");
                }
              }
            } else {
              throw new Error("Invalid QR code format");
            }

            // 5️⃣ Stop scanner immediately
            await html5QrCode.stop();
            setIsScanning(false);
            setIsInitializing(false);
            scannerRef.current = null;

            // 6️⃣ Navigate to payment page
            navigate("/payment-mid", {
              state: {
                vendorId,
                amount,
                transactionId: tid,
                userId
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
          
          // Don't show errors for normal scanning scenarios
          if (errorMessage.includes('No QR code found') || 
              errorMessage.includes('QR code not found') ||
              errorMessage.includes('No barcode') ||
              errorMessage.includes('Finder pattern') ||
              errorMessage.includes('Couldn\'t find enough') ||
              errorMessage.includes('MultiFormatReader') ||
              errorMessage.includes('NotFoundException')) {
            // These are normal scanning messages, not actual errors
            return;
          }
          
          // Only show real camera/permission errors
          if (errorMessage.includes('Permission denied') || 
              errorMessage.includes('NotAllowedError') ||
              errorMessage.includes('NotFoundError') ||
              errorMessage.includes('NotReadableError') ||
              errorMessage.includes('Camera') ||
              errorMessage.includes('Device')) {
            setError("Camera access denied or not available");
            setIsInitializing(false);
          }
        }
      ).then(() => {
        setIsScanning(true);
        setIsInitializing(false);
        setError("");
        
        // Clear any lingering error messages after successful start
        setTimeout(() => {
          if (isScanning && !error) {
            setError("");
          }
        }, 1000);
      }).catch((err) => {
        console.error("Failed to start scanner:", err);
        setError(`Failed to start scanner: ${err.message || 'Unknown error'}`);
        setIsScanning(false);
        setIsInitializing(false);
      });

    } catch (scannerErr) {
      console.error("Scanner initialization error:", scannerErr);
      setError(`Failed to initialize scanner: ${scannerErr.message || 'Unknown error'}`);
      setIsScanning(false);
      setIsInitializing(false);
    }
  };

  // Add cleanup function to stop camera when component unmounts
  const stopScanner = async () => {
    try {
      setIsStopping(true);
      console.log("Stopping scanner...");
      
      // Stop the scanner if it's running
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
        console.log("Scanner stopped successfully");
      }
      
      // Additional cleanup: stop any media tracks
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach(video => {
        const stream = video.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => {
            track.stop();
            console.log("Media track stopped");
          });
          video.srcObject = null;
        }
      });
      
      // Clear any remaining video elements
      const qrReaderElement = document.getElementById('qr-reader-page');
      if (qrReaderElement) {
        qrReaderElement.innerHTML = '';
      }
      
    } catch (error) {
      console.error("Error stopping scanner:", error);
    } finally {
      setIsScanning(false);
      setIsInitializing(false);
      setIsStopping(false);
    }
  };

  useEffect(() => {
    // Check if user is frozen
    if (frozen) {
      navigate(-1);
      return;
    }

    setIsScanning(true);
    setIsInitializing(true);
    setError("");

    let scanner = null;
    let initTimeout = null;
    
    try {
      // Reduce timeout to 5 seconds for faster feedback
      initTimeout = setTimeout(() => {
        if (isInitializing) {
          setError("Camera initialization timed out. Please check camera permissions and try again.");
          setIsInitializing(false);
          setIsScanning(false);
        }
      }, 5000); // 5 second timeout

      // Check camera permissions first
      const checkCameraPermission = async () => {
        try {
          // Request camera permission explicitly
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment',
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          });
          
          // Stop the stream and let scanner handle camera access
          stream.getTracks().forEach(track => track.stop());
          
          // Clear any existing scanner before initializing new one
          if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {});
            scannerRef.current = null;
          }
          
          // Initialize scanner with fresh state
          setTimeout(() => {
            setIsInitializing(false);
            setError("");
            initializeScanner();
          }, 100);
          
        } catch (permissionErr) {
          console.error("Camera permission error:", permissionErr);
          if (permissionErr.name === 'NotAllowedError') {
            setError("Camera access denied. Please allow camera permissions and try again.");
          } else if (permissionErr.name === 'NotFoundError') {
            setError("No camera found. Please connect a camera and try again.");
          } else if (permissionErr.name === 'NotReadableError') {
            setError("Camera is already in use by another application.");
          } else {
            setError(`Camera error: ${permissionErr.message || 'Unknown error'}`);
          }
          setIsInitializing(false);
          setIsScanning(false);
          
          if (initTimeout) {
            clearTimeout(initTimeout);
            initTimeout = null;
          }
        }
      };

      // Start the process
      checkCameraPermission();

    } catch (err) {
      console.error("Overall initialization error:", err);
      setError(`Camera initialization failed: ${err.message || 'Unknown error'}`);
      setIsScanning(false);
      setIsInitializing(false);
      
      // Clear timeout on error
      if (initTimeout) {
        clearTimeout(initTimeout);
        initTimeout = null;
      }
    }

    return () => {
      // Clear timeout on cleanup
      if (initTimeout) {
        clearTimeout(initTimeout);
        initTimeout = null;
      }
      
      // Stop scanner when component unmounts
      stopScanner();
    };
  }, [userId, frozen, navigate]);

  // Additional cleanup for page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopScanner();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleGoBack = async () => {
    await stopScanner();
    navigate(-1);
  };

  const handleCancel = async () => {
    await stopScanner();
    navigate(-1);
  };

  return (
    <div className="scanner-page">
      {/* Header */}
      <div className="scanner-header">
        <motion.button
          className="back-scan-btn"
          onClick={handleGoBack}
          whileHover={{ scale: isStopping ? 1 : 1.1 }}
          whileTap={{ scale: isStopping ? 1 : 0.9 }}
          disabled={isStopping}
        >
          {isStopping ? "Stopping..." : "← Back"}
        </motion.button>
        <h2 className="scan-title">Scan & Pay</h2>
        <p className="scan-subtitle">Position QR code within the frame</p>
      </div>

      {/* Scanner Container */}
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
          
          {/* Loading Indicator */}
          {isInitializing && (
            <div className="scanner-loading">
              <div className="loading-spinner"></div>
              <p>Initializing camera...</p>
              <button 
                className="retry-camera-btn"
                onClick={() => {
                  setIsInitializing(false);
                  setError("");
                  // Force re-render to retry initialization
                  setTimeout(() => setIsInitializing(true), 100);
                }}
              >
                Retry
              </button>
              <button 
                className="manual-camera-btn"
                onClick={() => {
                  // Manual camera trigger as fallback
                  setIsInitializing(false);
                  setError("");
                  // Try direct camera access
                  navigator.mediaDevices.getUserMedia({ 
                    video: { 
                      facingMode: 'environment',
                      width: { ideal: 640 },
                      height: { ideal: 480 }
                    } 
                  }).then(stream => {
                    // Show success message
                    setError("Camera accessed successfully! Initializing scanner...");
                    
                    // Clear any existing scanner first
                    if (scannerRef.current) {
                      scannerRef.current.stop().catch(() => {});
                      scannerRef.current = null;
                    }
                    
                    // Initialize scanner immediately
                    setTimeout(() => {
                      setIsInitializing(false); // Reset initializing state
                      setError(""); // Clear success message
                      initializeScanner(); // Initialize fresh scanner
                    }, 100);
                  }).catch(err => {
                    setError(`Manual camera access failed: ${err.message || 'Unknown error'}`);
                  });
                }}
              >
                Manual Camera Trigger
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          className="scan-error-container"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="scan-error-text">⚠️ {error}</p>
        </motion.div>
      )}

      {/* Instructions */}
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

      {/* Footer Actions */}
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
