import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";

function AdminVendorKYC() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate(-1);
      return;
    }

    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/admin/vendors");
        console.log("Fetched vendors:", response.data);
        setVendors(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setLoading(false);
      }
    };

    fetchVendors();
  }, [state, navigate]);

  const handleKYCUpdate = async (vendorId, status) => {
    try {
      await axios.post(`http://localhost:5000/admin/vendor/${vendorId}/kyc`, { status });
      
      // Refresh vendors list
      const response = await axios.get("http://localhost:5000/admin/vendors");
      setVendors(response.data);
      
      alert(`Vendor KYC ${status} successfully!`);
    } catch (err) {
      console.error("Error updating KYC:", err);
      alert("Failed to update KYC status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "success":
        return "green";
      case "rejected":
        return "red";
      case "pending":
      default:
        return "orange";
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return {
      backgroundColor: color,
      color: "white",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "bold",
      textTransform: "lowercase"
    };
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading vendors...</div>;
  }

  // Separate vendors into pending and completed
  const pendingVendors = vendors.filter(vendor => 
    !vendor.kyc?.status || vendor.kyc?.status === "pending"
  );
  const completedVendors = vendors.filter(vendor => 
    vendor.kyc?.status === "verified" || vendor.kyc?.status === "rejected" || vendor.kyc?.status === "success"
  );

  const VendorCard = ({ vendor }) => {
    console.log(`Vendor ${vendor._id} KYC data:`, vendor.kyc);
    console.log(`Vendor ${vendor._id} KYC imageUrl:`, vendor.kyc?.imageUrl);
    console.log(`Vendor ${vendor._id} KYC status:`, vendor.kyc?.status);
    
    return (
    <div 
      key={vendor._id} 
      style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "15px", 
        backgroundColor: "#f9f9f9" 
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <h4 style={{ margin: 0 }}>{vendor.vendorName}</h4>
            <span style={getStatusBadge(vendor.kyc?.status)}>
              {vendor.kyc?.status || "pending"}
            </span>
          </div>
          
          <p style={{ margin: "5px 0" }}>
            <strong>Vendor ID:</strong> {vendor.vendorId}
          </p>
          
          <p style={{ margin: "5px 0" }}>
            <strong>Email:</strong> {vendor.Email}
          </p>
          
          <p style={{ margin: "5px 0" }}>
            <strong>Registered:</strong> {new Date(vendor.createdAt).toLocaleDateString()}
          </p>
          
          <p style={{ margin: "5px 0" }}>
            <strong>KYC Submitted:</strong> {vendor.kyc?.submittedAt ? 
              new Date(vendor.kyc.submittedAt).toLocaleDateString() : 
              "Not submitted"
            }
          </p>
          
          {vendor.kyc?.imageUrl && (
            <div style={{ marginTop: "10px" }}>
              <strong>KYC Document:</strong>
              <br />
              <img 
                src={vendor.kyc.imageUrl} 
                alt="KYC Document" 
                style={{ 
                  maxWidth: "300px", 
                  maxHeight: "200px", 
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
                onClick={() => window.open(vendor.kyc.imageUrl, '_blank')}
              />
              <br />
              <small style={{ color: "#666" }}>Click image to view full size</small>
            </div>
          )}
          
          {!vendor.kyc?.imageUrl && (
            <div style={{ marginTop: "10px", color: "#666", fontStyle: "italic" }}>
              <strong>KYC Document:</strong> Not uploaded
            </div>
          )}
        </div>
        
        <div style={{ marginLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {vendor.kyc?.status === "pending" && (
            <>
              <button
                onClick={() => handleKYCUpdate(vendor._id, "verified")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                ✅ Approve
              </button>
              
              <button
                onClick={() => handleKYCUpdate(vendor._id, "rejected")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                ❌ Reject
              </button>
            </>
          )}
          
          {vendor.kyc?.status === "verified" && (
            <button
              onClick={() => handleKYCUpdate(vendor._id, "rejected")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              ❌ Reject
            </button>
          )}
          
          {vendor.kyc?.status === "rejected" && (
            <button
              onClick={() => handleKYCUpdate(vendor._id, "verified")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              ✅ Approve
            </button>
          )}
        </div>
      </div>
    </div>
    );
  };

  return (
    <>
      <Header 
        title="Vendor KYC Management" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <h2>Vendor KYC Management</h2>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          marginBottom: "20px", 
          padding: "8px 16px", 
          backgroundColor: "#007bff", 
          color: "white", 
          border: "none", 
          borderRadius: "4px", 
          cursor: "pointer" 
        }}
      >
        ← Back to Dashboard
      </button>

      {vendors.length === 0 ? (
        <p>No vendors found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* Pending KYC Section */}
          <div>
            <h3 style={{ 
              color: "#ff6b35", 
              borderBottom: "2px solid #ff6b35", 
              paddingBottom: "5px",
              marginBottom: "15px" 
            }}>
              ⏳ Pending KYC ({pendingVendors.length})
            </h3>
            {pendingVendors.length === 0 ? (
              <p style={{ color: "#666", fontStyle: "italic" }}>No pending KYC applications</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {pendingVendors.map(vendor => <VendorCard key={vendor._id} vendor={vendor} />)}
              </div>
            )}
          </div>

          {/* Completed KYC Section */}
          <div>
            <h3 style={{ 
              color: "#28a745", 
              borderBottom: "2px solid #28a745", 
              paddingBottom: "5px",
              marginBottom: "15px" 
            }}>
              ✅ Completed KYC ({completedVendors.length})
            </h3>
            {completedVendors.length === 0 ? (
              <p style={{ color: "#666", fontStyle: "italic" }}>No completed KYC applications</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {completedVendors.map(vendor => <VendorCard key={vendor._id} vendor={vendor} />)}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default AdminVendorKYC;
