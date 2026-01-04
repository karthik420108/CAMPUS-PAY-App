import { motion } from 'motion/react';

const SuspensionBanner = ({ show }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "white",
        padding: "16px 24px",
        zIndex: 1000,
        boxShadow: "0 4px 20px rgba(239, 68, 68, 0.3)",
        borderBottom: "3px solid #b91c1c",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ fontSize: "24px" }}>⚠️</div>
        <div>
          <strong>Account Suspended</strong>
          <br />
          Your account has been suspended by the admins/subadmins for fraud actions. 
          You cannot login to your account. Contact admins.
        </div>
      </div>
    </motion.div>
  );
};

export default SuspensionBanner;
