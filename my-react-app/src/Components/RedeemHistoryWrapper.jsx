import { useLocation } from "react-router-dom";
import AdminRedeemHistory from "./RedeemHistory.jsx";
import VendorRedeemHistory from "./Reedemhistory.jsx";

function RedeemHistoryWrapper() {
  const { state } = useLocation();
  const role = state?.role;

  // Debug logging (can be removed in production)
  console.log("RedeemHistoryWrapper - state:", state);
  console.log("RedeemHistoryWrapper - role:", role);

  if (role === "admin") {
    return <AdminRedeemHistory />;
  } else if (role === "vendor") {
    return <VendorRedeemHistory />;
  } else {
    // Fallback - you could redirect to login or show an error
    return (
      <div style={{ 
        padding: "50px", 
        textAlign: "center", 
        fontSize: "18px",
        color: "#666" 
      }}>
        Access denied. Please login again.
        <div style={{ marginTop: "20px", fontSize: "14px", color: "#999" }}>
          Debug: Role = {role || "undefined"}, State = {JSON.stringify(state)}
        </div>
      </div>
    );
  }
}

export default RedeemHistoryWrapper;
