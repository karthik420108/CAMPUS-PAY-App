import { motion, AnimatePresence } from "motion/react";
import "./SettingsOverlay.css";

function SettingsOverlay({ isOpen, onClose, theme, onNavigate }) {
  const isLight = theme === "light";

  const handleNavigation = (path, state) => {
    onNavigate(path, state);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="settings-overlay-content"
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Header */}
            <div className="settings-header">
              <motion.button
                className="close-settings-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
              <h2 className="settings-title">Settings</h2>
              <p className="settings-subtitle">Manage your account</p>
            </div>

            {/* Settings Options */}
            <div className="settings-options">
              {/* 👁️ View Profile */}
              <motion.button
                className="settings-option"
                onClick={() => handleNavigation("/viewv", { role: "student" })}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="option-icon">👁️</div>
                <div className="option-content">
                  <span className="option-title">View Profile</span>
                  <span className="option-description">See your profile information</span>
                </div>
                <div className="option-arrow">→</div>
              </motion.button>

              {/* ✏️ Edit Profile */}
              <motion.button
                className="settings-option"
                onClick={() => handleNavigation("/edit-profile")}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="option-icon">✏️</div>
                <div className="option-content">
                  <span className="option-title">Edit Profile</span>
                  <span className="option-description">Update your personal details</span>
                </div>
                <div className="option-arrow">→</div>
              </motion.button>

              {/* 🔐 Change MPIN */}
              <motion.button
                className="settings-option"
                onClick={() => handleNavigation("/change-mpin")}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="option-icon">🔐</div>
                <div className="option-content">
                  <span className="option-title">Change MPIN</span>
                  <span className="option-description">Update your security PIN</span>
                </div>
                <div className="option-arrow">→</div>
              </motion.button>
            </div>

            {/* Footer */}
            <div className="settings-footer">
              <motion.div
                className="settings-decoration"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="decoration-circle"></div>
                <div className="decoration-circle"></div>
                <div className="decoration-circle"></div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SettingsOverlay;
