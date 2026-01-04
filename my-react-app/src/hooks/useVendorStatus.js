import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useVendorStatus = (vendorId) => {
  const navigate = useNavigate();
  const [isSuspended, setIsSuspended] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showSuspensionBanner, setShowSuspensionBanner] = useState(false);

  useEffect(() => {
    if (!vendorId) return;

    const fetchVendorStatus = () => {
      axios
        .post(`http://localhost:5000/vendor/${vendorId}`)
        .then((res) => {
          const vendorData = res.data;
          
          // Update status states
          setIsSuspended(vendorData.isSuspended || false);
          setIsFrozen(vendorData.isFrozen || false);
          
          // Handle suspension
          if (vendorData.isSuspended && !showSuspensionBanner) {
            setShowSuspensionBanner(true);
            
            // Auto logout after 5 seconds if suspended
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 5000);
          }
          
          // Handle freezing - navigate to main dashboard if frozen
          if (vendorData.isFrozen && window.location.pathname !== "/vlogin") {
            // Navigate back to vendor dashboard
            navigate("/vlogin", { 
              state: { vendorId, role: "vendor" }, 
              replace: true 
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching vendor status:", err);
        });
    };

    // Initial fetch
    fetchVendorStatus();

    // Then set interval every 5 seconds for real-time updates
    const intervalId = setInterval(fetchVendorStatus, 5000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [vendorId, showSuspensionBanner, navigate]);

  return {
    isSuspended,
    isFrozen,
    showSuspensionBanner,
    setShowSuspensionBanner
  };
};
