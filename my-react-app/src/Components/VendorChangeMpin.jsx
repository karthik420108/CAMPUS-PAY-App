import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import Header from "./Header3.jsx";
import Footer from "./Footer.jsx";

function VendorChangeMpin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { vendorId } = location.state || {};

  const [step, setStep] = useState(1); // Step 1: Verify old MPIN, Step 2: Set new MPIN
  const [oldMpin, setOldMpin] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "light";
  });

  // Listen for theme changes from header
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "appTheme") {
        setTheme(e.newValue || "light");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for immediate updates
    const checkTheme = () => {
      const currentTheme = localStorage.getItem("appTheme");
      if (currentTheme !== theme) {
        setTheme(currentTheme || "light");
      }
    };
    
    const interval = setInterval(checkTheme, 100);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("appTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isLight = theme === "light";

  useEffect(() => {
    if (!vendorId) navigate("/vlogin");
  }, [vendorId, navigate]);

  const pageStyle = {
    minHeight: "100vh",
    background: isLight 
      ? "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
      : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden"
  };

  const cardStyle = {
    background: isLight 
      ? "rgba(255,255,255,0.95)"
      : "rgba(30,41,59,0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: isLight 
      ? "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)"
      : "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
    border: isLight 
      ? "1px solid rgba(255,255,255,0.8)"
      : "1px solid rgba(255,255,255,0.1)",
    maxWidth: "480px",
    width: "100%",
    position: "relative",
    zIndex: 10
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 20px",
    borderRadius: "16px",
    border: `2px solid ${isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)"}`,
    background: isLight 
      ? "rgba(255,255,255,0.8)"
      : "rgba(15,23,42,0.6)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    fontSize: "16px",
    color: isLight ? "#1e293b" : "#f1f5f9",
    outline: "none",
    transition: "all 0.3s ease",
    marginBottom: "20px",
    fontWeight: 500
  };

  const buttonStyle = {
    width: "100%",
    padding: "16px 24px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(120deg,#8b5cf6,#7c3aed,#6d28d9)",
    backgroundSize: "220% 220%",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "16px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: "0 16px 40px rgba(139,92,246,0.4), 0 0 0 1px rgba(139,92,246,0.3)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden"
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(120deg,#64748b,#475569,#334155)",
    boxShadow: "0 16px 40px rgba(100,116,139,0.3), 0 0 0 1px rgba(100,116,139,0.2)",
    marginTop: "12px"
  };

  // Step 1: Verify old MPIN
  const handleVerifyOldMpin = async (e) => {
    e.preventDefault();
    
    if (oldMpin.length !== 6 || !/^\d+$/.test(oldMpin)) {
      setMessage("Please enter valid 6-digit MPIN");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/verify-vendor-old-mpin", {
        vendorId,
        oldMpin
      });

      if (response.data.success) {
        setMessage("");
        setStep(2);
      } else {
        setMessage(response.data.message || "Invalid MPIN");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set new MPIN
  const handleSetNewMpin = async (e) => {
    e.preventDefault();

    if (newMpin.length !== 6 || !/^\d+$/.test(newMpin)) {
      setMessage("New MPIN must be 6 digits");
      return;
    }

    if (newMpin !== confirmMpin) {
      setMessage("New MPIN and confirmation don't match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/change-vendor-mpin", {
        vendorId,
        newMpin
      });

      if (response.data.success) {
        // Show success message
        setSuccessMessage("MPIN changed successfully!");
        
        // Fetch updated vendor data to maintain session
        const vendorResponse = await axios.post(`http://localhost:5000/vendor/${vendorId}`);
        const vendorData = vendorResponse.data;
        
        // Navigate back to vendor dashboard with full state
        setTimeout(() => {
          navigate("/vlogin", { 
            state: {
              vendorId: vendorData._id,
              vendorName: vendorData.vendorName,
              imageUrl: vendorData.ImageUrl,
              walletBalance: vendorData.Wallet,
              isFrozen: vendorData.isFrozen || false,
              isSuspended: vendorData.isSuspended || false
            }
          });
        }, 2000); // Show success message for 2 seconds
      } else {
        setMessage(response.data.message || "Failed to change MPIN");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to change MPIN");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to forgot MPIN
  const handleForgotMpin = () => {
    navigate("/forgot-mpin", { state: { userId: vendorId, role: "vendor" } });
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <div style={pageStyle}>
        {/* Background Orbs */}
        <motion.div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: isLight 
              ? "radial-gradient(circle at 30% 0%, #ddd6fe, #a5b4fc, #818cf8)"
              : "radial-gradient(circle at 30% 0%, #ddd6fe, #a5b4fc, #818cf8)",
            filter: "blur(80px)",
            opacity: 0.3,
            top: -100,
            right: -100,
            zIndex: 0,
            pointerEvents: "none"
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          style={cardStyle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <motion.div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(120deg,#8b5cf6,#7c3aed,#6d28d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "36px",
                boxShadow: "0 16px 40px rgba(139,92,246,0.3)"
              }}
              whileHover={{ scale: 1.05 }}
            >
              🔐
            </motion.div>
            <h1 style={{ 
              fontSize: "28px", 
              fontWeight: 800, 
              margin: 0, 
              color: isLight ? "#1e293b" : "#f1f5f9",
              marginBottom: "8px"
            }}>
              Change MPIN
            </h1>
            <p style={{ 
              margin: 0, 
              color: isLight ? "#64748b" : "#94a3b8",
              fontSize: "16px"
            }}>
              {step === 1 ? "Verify your current MPIN" : "Set your new MPIN"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleVerifyOldMpin}>
                  <input
                    type="password"
                    value={oldMpin}
                    onChange={(e) => setOldMpin(e.target.value)}
                    placeholder="Enter current MPIN"
                    maxLength={6}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = isLight ? "#8b5cf6" : "#a78bfa";
                      e.target.style.boxShadow = isLight
                        ? "0 0 0 3px rgba(139,92,246,0.1)"
                        : "0 0 0 3px rgba(167,139,250,0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)";
                      e.target.style.boxShadow = "none";
                    }}
                  />

                  {/* Forgot MPIN Button */}
                  <button
                    type="button"
                    onClick={handleForgotMpin}
                    style={{
                      background: "none",
                      border: "none",
                      color: isLight ? "#8b5cf6" : "#a78bfa",
                      fontSize: "14px",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontWeight: 500,
                      marginBottom: "20px",
                      width: "100%",
                      textAlign: "center"
                    }}
                  >
                    Forgot MPIN?
                  </button>

                  {/* Message Display */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          background: isLight ? "#fef2f2" : "#7f1d1d",
                          color: isLight ? "#dc2626" : "#fca5a5",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          fontSize: "14px",
                          marginBottom: "20px",
                          border: isLight 
                            ? "1px solid rgba(220,38,38,0.2)"
                            : "1px solid rgba(248,113,113,0.3)"
                        }}
                      >
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Verify Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...buttonStyle,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                    whileHover={!loading ? { scale: 1.02, boxShadow: "0 20px 50px rgba(139,92,246,0.5)" } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    animate={!loading ? {
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: !loading ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {loading ? "Verifying..." : "Verify MPIN"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSetNewMpin}>
                  <input
                    type="password"
                    value={newMpin}
                    onChange={(e) => setNewMpin(e.target.value)}
                    placeholder="Enter new MPIN"
                    maxLength={6}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = isLight ? "#8b5cf6" : "#a78bfa";
                      e.target.style.boxShadow = isLight
                        ? "0 0 0 3px rgba(139,92,246,0.1)"
                        : "0 0 0 3px rgba(167,139,250,0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)";
                      e.target.style.boxShadow = "none";
                    }}
                  />

                  <input
                    type="password"
                    value={confirmMpin}
                    onChange={(e) => setConfirmMpin(e.target.value)}
                    placeholder="Confirm new MPIN"
                    maxLength={6}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = isLight ? "#8b5cf6" : "#a78bfa";
                      e.target.style.boxShadow = isLight
                        ? "0 0 0 3px rgba(139,92,246,0.1)"
                        : "0 0 0 3px rgba(167,139,250,0.2)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)";
                      e.target.style.boxShadow = "none";
                    }}
                  />

                  {/* Message Display */}
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          background: isLight ? "#fef2f2" : "#7f1d1d",
                          color: isLight ? "#dc2626" : "#fca5a5",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          fontSize: "14px",
                          marginBottom: "20px",
                          border: isLight 
                            ? "1px solid rgba(220,38,38,0.2)"
                            : "1px solid rgba(248,113,113,0.3)"
                        }}
                      >
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Buttons */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...buttonStyle,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                    whileHover={!loading ? { scale: 1.02, boxShadow: "0 20px 50px rgba(139,92,246,0.5)" } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    animate={!loading ? {
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: !loading ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {loading ? "Processing..." : "Change MPIN"}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    style={secondaryButtonStyle}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ← Back
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Success Banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                background: "linear-gradient(120deg, #10b981, #059669, #047857)",
                color: "#ffffff",
                padding: "16px 24px",
                borderRadius: "16px",
                boxShadow: "0 16px 40px rgba(16,185,129,0.4), 0 0 0 1px rgba(16,185,129,0.3)",
                fontSize: "16px",
                fontWeight: 600,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)"
              }}
            >
              <span style={{ fontSize: "20px" }}>✅</span>
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </>
  );
}

export default VendorChangeMpin;
