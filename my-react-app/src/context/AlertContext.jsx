import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = ({ type = 'info', title, message, buttonText = 'OK', duration = null }) => {
    setAlert({
      id: Date.now(),
      type,
      title,
      message,
      buttonText,
      duration
    });
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const value = {
    alert,
    showAlert,
    hideAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
