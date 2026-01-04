import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header.jsx";

function AdminMonitorVendors() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }

    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/monitor/vendors"
      );
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorDetails = async (vendorId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/admin/monitor/vendor/${vendorId}`
      );
      setSelectedVendor(res.data);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFreeze = async (vendorId, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/monitor/vendor/${vendorId}/freeze`,
        { isFrozen: !currentStatus }
      );
      
      // Refresh the list
      fetchVendors();
      if (selectedVendor && selectedVendor.vendor._id === vendorId) {
        fetchVendorDetails(vendorId);
      }
    } catch (err) {
      alert("Failed to update vendor status");
    }
  };

  const toggleSuspend = async (vendorId, currentStatus) => {
    try {
      const reason = currentStatus 
        ? prompt("Enter reason for unsuspending:")
        : prompt("Enter reason for suspension:");
      
      if (reason === null) return; // User cancelled

      await axios.put(
        `http://localhost:5000/admin/monitor/vendor/${vendorId}/suspend`,
        { 
          isSuspended: !currentStatus,
          reason: reason 
        }
      );
      
      fetchVendors();
    } catch (err) {
      alert("Failed to update vendor suspend status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
      case "success":
        return "green";
      case "pending":
        return "orange";
      case "rejected":
        return "red";
      default:
        return "black";
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header 
        title="Monitor Vendors" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 16px" }}>
        <h2>Admin – Vendor Monitor</h2>
        
        {!showDetails ? (
          <>
            {vendors.length === 0 ? (
              <p>No vendors found</p>
            ) : (
              <table border="1" cellPadding="10" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Vendor ID</th>
                    <th>Email</th>
                    <th>Wallet Balance</th>
                    <th>KYC Status</th>
                    <th>Freeze Status</th>
                    <th>Suspend Status</th>
                    <th>Transactions</th>
                    <th>Redeems</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor._id}>
                      <td>{vendor.vendorName}</td>
                      <td>{vendor.vendorid}</td>
                      <td>{vendor.Email}</td>
                      <td>₹{vendor.Wallet?.toFixed(4) || 0}</td>
                      <td style={{ color: getStatusColor(vendor.kyc?.status) }}>
                        {vendor.kyc?.status || "pending"}
                      </td>
                      <td>
                        <span style={{ 
                          color: vendor.isFrozen ? "red" : "green",
                          fontWeight: "bold"
                        }}>
                          {vendor.isFrozen ? "FROZEN" : "ACTIVE"}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          color: vendor.isSuspended ? "red" : "green",
                          fontWeight: "bold"
                        }}>
                          {vendor.isSuspended ? "SUSPENDED" : "ACTIVE"}
                        </span>
                      </td>
                      <td>{vendor.totalTransactions || 0}</td>
                      <td>{vendor.totalRedeems || 0}</td>
                      <td>
                        <button
                          onClick={() => fetchVendorDetails(vendor._id)}
                          style={{ background: "blue", color: "white", marginRight: "5px" }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => toggleFreeze(vendor._id, vendor.isFrozen)}
                          style={{ 
                            background: vendor.isFrozen ? "green" : "red", 
                            color: "white",
                            marginRight: "5px"
                          }}
                        >
                          {vendor.isFrozen ? "Unfreeze" : "Freeze"}
                        </button>
                        <button
                          onClick={() => toggleSuspend(vendor._id, vendor.isSuspended)}
                          style={{ 
                            background: vendor.isSuspended ? "green" : "orange", 
                            color: "white"
                          }}
                        >
                          {vendor.isSuspended ? "Unsuspend" : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <div>
            <button 
              onClick={() => setShowDetails(false)}
              style={{ marginBottom: "20px", background: "gray", color: "white" }}
            >
              ← Back to List
            </button>
            
            {selectedVendor && (
              <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
                <h3>Vendor Details: {selectedVendor.vendor.vendorName}</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <h4>Basic Info</h4>
                    <p><strong>Vendor ID:</strong> {selectedVendor.vendor.vendorid}</p>
                    <p><strong>Email:</strong> {selectedVendor.vendor.Email}</p>
                    <p><strong>Wallet:</strong> ₹{selectedVendor.vendor.Wallet?.toFixed(4) || 0}</p>
                    <p><strong>KYC Status:</strong> 
                      <span style={{ color: getStatusColor(selectedVendor.vendor.kyc?.status) }}>
                        {selectedVendor.vendor.kyc?.status || "pending"}
                      </span>
                    </p>
                    <p><strong>Status:</strong> 
                      <span style={{ 
                        color: selectedVendor.vendor.isFrozen ? "red" : "green",
                        fontWeight: "bold"
                      }}>
                        {selectedVendor.vendor.isFrozen ? "FROZEN" : "ACTIVE"}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <h4>Statistics</h4>
                    <p><strong>Total Transactions:</strong> {selectedVendor.stats.totalTransactions}</p>
                    <p><strong>Successful Transactions:</strong> {selectedVendor.stats.successfulTransactions}</p>
                    <p><strong>Total Redeems:</strong> {selectedVendor.stats.totalRedeems}</p>
                    <p><strong>Total Redeem Amount:</strong> ₹{selectedVendor.stats.totalRedeemAmount?.toFixed(4) || 0}</p>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <h4>Recent Transactions (Last 5)</h4>
                    {selectedVendor.transactions.length === 0 ? (
                      <p>No transactions</p>
                    ) : (
                      <table border="1" cellPadding="5" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedVendor.transactions.slice(0, 5).map((tx, index) => (
                            <tr key={index}>
                              <td>{tx.userId?.firstName} {tx.userId?.lastName}</td>
                              <td>₹{tx.amount}</td>
                              <td style={{ color: tx.status === "SUCCESS" ? "green" : "red" }}>
                                {tx.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  
                  <div>
                    <h4>Recent Redeems (Last 5)</h4>
                    {selectedVendor.redeemRequests.length === 0 ? (
                      <p>No redeem requests</p>
                    ) : (
                      <table border="1" cellPadding="5" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedVendor.redeemRequests.slice(0, 5).map((redeem, index) => (
                            <tr key={index}>
                              <td>₹{redeem.amount}</td>
                              <td style={{ color: redeem.status === "SUCCESS" ? "green" : redeem.status === "FAILED" ? "red" : "orange" }}>
                                {redeem.status}
                              </td>
                              <td>{new Date(redeem.date).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminMonitorVendors;
