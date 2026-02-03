import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { registerCredential, isWebAuthnSupported } from '../utils/webauthn';
import './BiometricModal.css';

function BiometricModal({ isOpen, onClose, userId, theme, onSuccess, userRole = 'student' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isLight = theme === 'light';
  const textMain = isLight ? '#0f172a' : '#e5e7eb';
  const bgCard = isLight
    ? 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))'
    : 'linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))';
  const borderColor = isLight ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.45)';

  const handleRegisterBiometric = async () => {
    if (!userId) {
      setError('User ID not available');
      return;
    }
    setError('');
    setLoading(true);
    try {
      console.log('[BiometricModal] Registering for userId:', userId, 'userRole:', userRole);
      const res = await registerCredential(userId, userRole);
      console.log('[BiometricModal] Response:', res);
      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(res?.error || 'Registration failed');
      }
    } catch (err) {
      console.error('[BiometricModal] Error:', err);
      setError(err.message || 'Biometric registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isWebAuthnSupported()) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="biometric-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <motion.div
            className="biometric-modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: bgCard,
              border: `1px solid ${borderColor}`,
              boxShadow: isLight
                ? '0 16px 38px rgba(15,23,42,0.18)'
                : '0 18px 55px rgba(15,23,42,0.85)',
              padding: '32px 24px',
              borderRadius: 16,
              maxWidth: 400,
              width: '90%',
              color: textMain,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 4 }}>
                Enable Biometric Login
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: isLight ? '#6b7280' : '#94a3b8',
                  margin: 0,
                }}
              >
                Use your fingerprint, face, or PIN for faster login
              </p>
            </div>

            {/* Success State */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  textAlign: 'center',
                  color: '#16a34a',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ✓ Biometric enabled! Ready to use.
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  textAlign: 'center',
                  color: '#dc2626',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>⚡</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Faster Login</div>
                  <div style={{ fontSize: 12, color: isLight ? '#6b7280' : '#94a3b8' }}>
                    No need to remember passwords
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Secure</div>
                  <div style={{ fontSize: 12, color: isLight ? '#6b7280' : '#94a3b8' }}>
                    Encrypted end-to-end
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>📱</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Works Everywhere</div>
                  <div style={{ fontSize: 12, color: isLight ? '#6b7280' : '#94a3b8' }}>
                    Web, mobile, and app
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <motion.button
                onClick={handleRegisterBiometric}
                disabled={loading || success}
                whileHover={!loading && !success ? { scale: 1.02 } : {}}
                whileTap={!loading && !success ? { scale: 0.98 } : {}}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(120deg,#3b82f6,#0ea5e9)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: loading || success ? 'not-allowed' : 'pointer',
                  opacity: loading || success ? 0.7 : 1,
                }}
              >
                {loading ? '⏳ Registering...' : success ? '✓ Done!' : '🔐 Enable Biometric'}
              </motion.button>
              <motion.button
                onClick={onClose}
                disabled={loading || success}
                whileHover={!loading && !success ? { scale: 1.02 } : {}}
                whileTap={!loading && !success ? { scale: 0.98 } : {}}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: `1px solid ${borderColor}`,
                  background: 'transparent',
                  color: textMain,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: loading || success ? 'not-allowed' : 'pointer',
                  opacity: loading || success ? 0.6 : 1,
                }}
              >
                Remind me later
              </motion.button>
            </div>

            {/* Footer Info */}
            <div
              style={{
                fontSize: 11,
                color: isLight ? '#9ca3af' : '#64748b',
                textAlign: 'center',
                lineHeight: '1.4',
              }}
            >
              Your biometric data stays secure on your device. We never store fingerprints or face scans on our servers.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BiometricModal;
