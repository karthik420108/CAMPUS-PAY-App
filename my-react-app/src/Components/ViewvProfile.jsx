import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";
import Header from "./Header3"
function ViewvProfile() {
  const { state } = useLocation();
  const { vendorId, role } = state || {};
  const navigate = useNavigate();

  const [vendorName, setVendorName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState(0);
  const [parentEmail, setParentEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [id , setId] = useState("");

  const isLight = theme === "light";
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

  const pageStyle = isLight
    ? {
        background:
          "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%)," +
          "radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
        backgroundColor: "#f3f4f6",
      }
    : {
        backgroundColor: "#020617",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%)," +
          "radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%)," +
          "radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%)," +
          "radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%)," +
          "linear-gradient(to right, rgba(15,23,42,0.9) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(15,23,42,0.9) 1px, transparent 1px)",
        backgroundSize: "cover, cover, cover, cover, 80px 80px, 80px 80px",
      };

  const cardStyle = isLight
    ? {
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow:
          "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)",
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow:
          "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
      };

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    const fetchVendor = async () => {
      try {
        const res = await axios.post("http://localhost:5000/vendore/profile", { vendorId });
        const vendor = res.data.vendor;
        setVendorName(vendor.vendorName);
        setImageUrl(vendor.ImageUrl);
        setEmail(vendor.Email);
        setWallet(vendor.Wallet);
        setId(vendor.vendorid)
      } catch (err) {
        console.error("Vendor profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchStudent = async () => {
      try {
        const res = await axios.post("http://localhost:5000/usere/profile", { vendorId });
        const user = res.data.user;
        setVendorName(`${user.firstName} ${user.lastName}`);
        setEmail(user.collegeEmail);
        setParentEmail(user.parentEmail);
        setImageUrl(user.ImageUrl);
        setWallet(user.walletBalance);
      } catch (err) {
        console.error("Student profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    role === "vendor" ? fetchVendor() : fetchStudent();
  }, [vendorId, role]);

  if (loading)
    return <h2 style={{ textAlign: "center", marginTop: 50 }}>Loading...</h2>;

  if (!vendorId)
    return <h2 style={{ textAlign: "center", marginTop: 50 }}>No user data found.</h2>;

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <motion.div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          overflow: "hidden",
          position: "relative",
          ...pageStyle,
        }}
      >
        {/* Floating orbs */}
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
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Back button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.02, boxShadow: "0 0 18px rgba(59,130,246,0.5)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            padding: "8px 14px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
            color: "#f9fafb",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
            zIndex: 10,
          }}
        >
          ← Back
        </motion.button>

        {/* Profile card */}
        <motion.div
          style={{
            width: "100%",
            maxWidth: 500,
            borderRadius: 28,
            padding: "26px 22px 20px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
            overflow: "hidden",
            ...cardStyle,
          }}
        >
          {/* top gradient line */}
          <motion.div
            style={{
              position: "absolute",
              left: 26,
              right: 26,
              top: 10,
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              opacity: 0.9,
            }}
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* theme toggle */}
          
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "#6b7280" }}>Mode</span>
            <button
              type="button"
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
              style={{
                border: "none",
                borderRadius: 999,
                padding: "4px 12px",
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

          {/* profile image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Profile"
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                objectFit: "cover",
                border: `3px solid ${isLight ? "#3b82f6" : "#0ea5e9"}`,
                alignSelf: "center",
              }}
            />
          )}

          {/* profile info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ color: textMain, fontSize: 16 }}>
              <strong>Name:</strong> {vendorName}
            </p>
            <p style={{ color: textSub, fontSize: 14 }}>
              <strong>Email:</strong> {email}
            </p>
            {role !== "vendor" && (
              <p style={{ color: textSub, fontSize: 14 }}>
                <strong>Parent Email:</strong> {parentEmail}
              </p>
            )}
            
            {role == "vendor" && <p style={{ color: textMain, fontSize: 16, fontWeight: 600 }}>
              <strong>ID:</strong> {id}
            </p>}
            
            <p style={{ color: textMain, fontSize: 16, fontWeight: 600 }}>
              {role === "vendor"
                ? `Wallet Balance: ₹${wallet}`
                : `Your Spendings: ₹${wallet}`}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default ViewvProfile;
