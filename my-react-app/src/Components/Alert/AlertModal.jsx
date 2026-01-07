import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../../context/AlertContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  X
} from 'lucide-react';
import './AlertStyles.css';

const AlertModal = () => {
  const { alert, hideAlert } = useAlert();

  const getAlertConfig = (type) => {
    const configs = {
      success: {
        icon: CheckCircle,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        bgGradient: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(5,150,105,0.12))'
      },
      error: {
        icon: XCircle,
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        bgGradient: 'linear-gradient(145deg, rgba(239,68,68,0.08), rgba(220,38,38,0.12))'
      },
      warning: {
        icon: AlertTriangle,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        bgGradient: 'linear-gradient(145deg, rgba(245,158,11,0.08), rgba(217,119,6,0.12))'
      },
      info: {
        icon: Info,
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        bgGradient: 'linear-gradient(145deg, rgba(59,130,246,0.08), rgba(37,99,235,0.12))'
      }
    };
    return configs[type] || configs.info;
  };

  if (!alert) return null;

  const config = getAlertConfig(alert.type);
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        className="alert-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={hideAlert}
      >
        <motion.div
          className="alert-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ 
            duration: 0.2, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: config.bgGradient,
            borderLeft: `4px solid ${config.color}`
          }}
        >
          {/* Close Icon */}
          <button 
            className="alert-close-btn"
            onClick={hideAlert}
            style={{ color: config.color }}
          >
            <X size={20} />
          </button>

          {/* Alert Content */}
          <div className="alert-content">
            <div className="alert-icon-wrapper" style={{ background: config.gradient }}>
              <Icon size={24} color="white" />
            </div>
            
            <div className="alert-text">
              <h3 className="alert-title">{alert.title}</h3>
              <p className="alert-message">{alert.message}</p>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            className="alert-button"
            style={{ background: config.gradient }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={hideAlert}
          >
            {alert.buttonText}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertModal;
