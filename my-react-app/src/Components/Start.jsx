import React from "react";
import Footer from "./Footer.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "motion/react";
import bgVideo from "./Campus_Pay_Seamless_Student_Transactions.mp4"; // Import video
import Header3 from "./Header3.jsx";
import { useAlert } from "../context/AlertContext";
import API_CONFIG from "../config/api";

function Start() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("HI")

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post(API_CONFIG.getUrl("/login"), { email, password });
      const { username, userId, email: userEmail, userCreatedAt, isFrozen, imageUrl, walletBalance, role, vendorId, SubAdminName, subAdminId } = res.data;

      if (role === "vendor") {
        navigate("/vlogin", { state: { vendorId, role } });
        return;
      }
      if (role === "admin") {
        navigate("/admin", { state: { role } });
        return;
      }
      if (role === "SubAdmin") {
        navigate("/subadmin", { state: { role, SubAdminName, subAdminId, imageUrl } });
        return;
      }

      const res2 = await axios.post(API_CONFIG.getUrl("/institute-balance"));
      navigate("/login", {
        state: {
          username,
          email: userEmail,
          userId,
          userCreatedAt,
          isFrozen,
          imageUrl,
          walletBalance,
          instBalance: res2.data.balance,
          role: "student",
        },
      });
    } catch (err) {
      if (err.response?.data?.error) {
        const msg = err.response.data.error;
        if (msg.toLowerCase().includes("email")) setError("Email does not exist");
        else if (msg.toLowerCase().includes("password")) setError("Password is incorrect");
        else if (err.response.data.isSuspended) {
          // Show suspension message in a popup
          showAlert({
            type: "error",
            title: "Account Suspended",
            message: err.response.data.error
          });
          setError("Account suspended");
        }
        else setError("Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(API_CONFIG.getUrl("/google-login"), {
        credential: credentialResponse.credential,
      });
      if (!res.data.exists) {
        setError("No account associated with this Google email. Please sign up first.");
        return;
      }
      console.log(res)
      const res2 = await axios.post(API_CONFIG.getUrl("/institute-balance"));
      if (res.data.role === "student") {
        navigate("/login", {
          state: {
            username: res.data.username,
            email: res.data.email,
            userId: res.data.userId,
            imageUrl: res.data.imageUrl,
            walletBalance: res.data.walletBalance,
            isFrozen: res.data.isFrozen,
            isSuspended: res.data.isSuspended,
            instBalance: res2.data.balance,
            role: "student",
          },
        });
      } else if (res.data.role === "vendor") {
        navigate("/vlogin", { 
          state: { 
            vendorId: res.data.vendorId, 
            role: "vendor",
            isSuspended: res.data.isSuspended 
          } 
        });
      } else if (res.data.role === "admin") {
        navigate("/admin", { state: { role: "Admin" } });
      } else if (res.data.role === "SubAdmin") {
        navigate("/subadmin", {
          state: {
            role: "SubAdmin",
            SubAdminName: res.data.SubAdminName,
            subAdminId: res.data.subAdminId,
            imageUrl: res.data.imageUrl,
          },
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        const msg = err.response.data.error;
        if (err.response.data.isSuspended) {
          // Show suspension message in a popup
          showAlert({
            type: "error",
            title: "Account Suspended",
            message: err.response.data.error
          });
          setError("Account suspended");
        } else {
          setError("Google login failed");
        }
      } else {
        setError("Google login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";
  const errorColor = isLight ? "#b91c1c" : "#fecaca";

  const pageStyle = {
    width: "100vw",
    height: "100vh",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "transparent",
    overflow: "hidden",
  };

  const cardStyle = isLight
    ? {
        background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow: "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)",
      }
    : {
        background: "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow: "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
      };

  const inputStyle = isLight
    ? {
        background: "radial-gradient(circle at 0 0, rgba(219,234,254,0.9), transparent 70%), rgba(255,255,255,0.98)",
        border: "1px solid rgba(148,163,184,0.9)",
        boxShadow: "0 10px 24px rgba(15,23,42,0.10), inset 0 0 0 1px rgba(248,250,252,0.95)",
      }
    : {
        background: "radial-gradient(circle at 0 0, rgba(30,64,175,0.38), transparent 70%), #020617",
        border: "1px solid rgba(51,65,85,0.95)",
        boxShadow: "0 12px 30px rgba(15,23,42,0.75), inset 0 0 0 1px rgba(15,23,42,0.9)",
      };

  return (
    <div style={pageStyle}>
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: isLight ? 0.45 : 0.3,
        }}
      >
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Background Orbs */}
      <motion.div
        style={{
          position: "absolute",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
            : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
          filter: "blur(40px)",
          opacity: 0.5,
          top: -40,
          left: -60,
          mixBlendMode: isLight ? "normal" : "screen",
          zIndex: 1,
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          width: 210,
          height: 210,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 70% 80%, #bae6fd, #7dd3fc, #22c55e)"
            : "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
          filter: "blur(34px)",
          opacity: 0.5,
          bottom: -40,
          right: -40,
          mixBlendMode: isLight ? "normal" : "screen",
          zIndex: 1,
        }}
        animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Simple Campus Pay Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          padding: "20px",
          zIndex: 2,
          background: isLight 
            ? "rgba(255, 255, 255, 0.1)" 
            : "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: `1px solid ${isLight ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}`
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#3b82f6",
            margin: 0,
            textShadow: isLight 
              ? "0 2px 8px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)" 
              : "0 2px 12px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)",
            letterSpacing: "1px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Campus Pay
        </h1>
      </div>

      <motion.div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 28,
            padding: "32px 28px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            ...cardStyle,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>Login</h2>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            style={{ padding: "12px 14px", borderRadius: 14, fontSize: 14, outline: "none", ...inputStyle }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            style={{ padding: "12px 14px", borderRadius: 14, fontSize: 14, outline: "none", ...inputStyle }}
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: easingSoft }}
                style={{ color: errorColor, fontSize: 13, textAlign: "center", fontWeight: 500 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 18px rgba(59,130,246,0.5)" } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
              color: "#f9fafb",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              fontSize: 14,
              textTransform: "uppercase",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginTop: 12 }}>
            <Link to="/forgot" style={{ color: "#3b82f6" }}>Forgot Password?</Link>
            <Link to="/role-select" style={{ color: "#10b981" }}>Create an Account</Link>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google login failed")} />
          </div>

          {/* Theme Toggle */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 6px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
              fontSize: 11,
            }}
          >
            <span style={{ color: "#6b7280" }}>Mode</span>
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "3px 10px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                background: isLight
                  ? "linear-gradient(120deg,#020617,#0f172a)"
                  : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
                color: isLight ? "#e5e7eb" : "#0f172a",
              }}
            >
              {isLight ? "Dark" : "Light"}
            </button>
          </div>
        </motion.form>
      </motion.div>

      <Footer />
    </div>
  );
}

export default Start;
