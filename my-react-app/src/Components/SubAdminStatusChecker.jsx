import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SubAdminStatusChecker({ subAdminId, children }) {
  const [showDeletedOverlay, setShowDeletedOverlay] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!subAdminId) return;

    const checkSubAdminExists = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/subadmin/check/${subAdminId}`
        );
        
        if (response.status === 200 && response.data.exists === false) {
          console.log("SubAdmin no longer exists, showing overlay");
          setShowDeletedOverlay(true);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("SubAdmin not found (404), showing overlay");
          setShowDeletedOverlay(true);
        } else {
          console.error("Error checking SubAdmin status:", error);
        }
      }
    };

    // Check immediately on mount
    checkSubAdminExists();

    // Set up periodic check every 5-7 seconds (using 6 seconds as middle ground)
    const intervalId = setInterval(checkSubAdminExists, 6000);

    return () => {
      clearInterval(intervalId);
    };
  }, [subAdminId]);

  const handleNavigateHome = () => {
    // Clear localStorage data
    localStorage.removeItem('subAdminId');
    localStorage.removeItem('subAdminToken');
    localStorage.removeItem('subAdminName');
    navigate("/");
  };

  if (showDeletedOverlay) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            maxWidth: "400px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "20px",
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              margin: "0 0 16px 0",
              color: "#dc2626",
              fontSize: "24px",
            }}
          >
            Account Deactivated
          </h2>
          <p
            style={{
              margin: "0 0 24px 0",
              color: "#6b7280",
              lineHeight: "1.6",
            }}
          >
            Your SubAdmin account has been deactivated by the administrator. 
            You will be redirected to the home page.
          </p>
          <button
            onClick={handleNavigateHome}
            style={{
              padding: "12px 24px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#b91c1c";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#dc2626";
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default SubAdminStatusChecker;
