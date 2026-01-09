import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import { motion } from 'motion/react';
import API_CONFIG from "../config/api";

function PaymentCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light'); // Light/Dark toggle
  const isLight = theme === 'light';

  const { userId, vendorId, amount, txid, Status, vName, Datee } = location.state || {};

  // ---------- THEME-DEPENDENT STYLES (Copied from RaiseComplaint) ----------
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
        backgroundPosition: "center, center, center, center, 0 0, 0 0",
      };

  async function func() {
    const res = await axios.post(API_CONFIG.getUrl(`/info/${userId}`));
    const {
      username,
      userId: uid,
      isFrozen,
      imageUrl,
      walletBalance,
      userCreatedAt,
    } = res.data;

    const res2 = await axios.post(API_CONFIG.getUrl('/institute-balance'));

    navigate('/login', {
      state: {
        username,
        userId: uid,
        isFrozen,
        imageUrl,
        walletBalance,
        userCreatedAt,
        instBalance: res2.data.balance,
      },
    });
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        ...pageStyle, // Applied the complex background styles here
      }}
    >
      {/* Soft background orbs (Updated to match RaiseComplaint) */}
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
          zIndex: 0,
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
          zIndex: 0,
        }}
        animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          borderRadius: 28,
          padding: 24,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: isLight
            ? 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))'
            : 'linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))',
          border: isLight
            ? '1px solid rgba(148,163,184,0.35)'
            : '1px solid rgba(148,163,184,0.45)',
          boxShadow: isLight
            ? '0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)'
            : '0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)',
          color: isLight ? '#0f172a' : '#e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
          zIndex: 1, // above orbs
        }}
      >
        {/* Top Accent Line */}
        <motion.div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: 10,
            height: 2,
            borderRadius: 999,
            background: 'linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)',
            opacity: 0.9,
          }}
          animate={{ x: [-8, 8, -8] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Theme Toggle */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 4px',
            borderRadius: 999,
            border: '1px solid rgba(148,163,184,0.6)',
            background: isLight ? '#f9fafb' : 'rgba(15,23,42,0.9)',
            fontSize: 10,
            zIndex: 5,
          }}
        >
          <span style={{ color: '#6b7280', fontSize: 9 }}>Mode</span>
          <button
            type="button"
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: isLight
                ? 'linear-gradient(120deg,#020617,#0f172a)'
                : 'linear-gradient(120deg,#e5f2ff,#dbeafe)',
              color: isLight ? '#e5e7eb' : '#0f172a',
            }}
          >
            {isLight ? 'Dark' : 'Light'}
          </button>
        </div>

        <h2
          style={{
            textAlign: 'center',
            marginBottom: 20,
            marginTop: 24,
            fontSize: 22,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Transaction Details
        </h2>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 16px', alignItems: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transaction ID:</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: isLight ? '#1f2937' : '#e5e7eb' }}>{txid}</div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User ID:</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: isLight ? '#1f2937' : '#e5e7eb' }}>{userId}</div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vendor Name:</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: isLight ? '#1f2937' : '#e5e7eb' }}>🏪 {vName}</div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount:</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: Status === 'SUCCESS' ? '#22c55e' : isLight ? '#1f2937' : '#e5e7eb' }}>₹{Number(amount)}</div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time:</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: isLight ? '#1f2937' : '#e5e7eb' }}>{Datee}</div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status:</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: Status === 'SUCCESS' ? '#22c55e' : '#ef4444' }}>{Status}</div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={func}
          style={{
            marginTop: 24,
            padding: '12px 24px',
            borderRadius: 16,
            border: 'none',
            background: Status === 'SUCCESS' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 15,
            alignSelf: 'center'
          }}
        >
          Back To Home
        </motion.button>
      </div>
    </div>
  );
}

export default PaymentCard;
