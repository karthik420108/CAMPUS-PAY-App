import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "resolved"
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate(-1);
      return;
    }

    const fetchComplaints = async () => {
      try {
        const response = await axios.get("http://localhost:5000/admin/complaints");
        console.log("Admin complaints response:", response.data);
        // Filter to show only forwarded complaints
        const forwardedComplaints = response.data.filter(complaint => complaint.isForwarded === true);
        console.log("Filtered forwarded complaints:", forwardedComplaints);
        setComplaints(forwardedComplaints);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [state, navigate]);

  const handleResponse = async (complaintId) => {
    if (!responseText.trim()) {
      alert("Please enter a response message");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/admin/complaint/${complaintId}/respond`, {
        response: responseText
      });
      
      // Refresh complaints list
      const response = await axios.get("http://localhost:5000/admin/complaints");
      const forwardedComplaints = response.data.filter(complaint => complaint.isForwarded === true);
      setComplaints(forwardedComplaints);
      
      setRespondingTo(null);
      setResponseText("");
      alert("Response sent successfully!");
    } catch (err) {
      console.error("Error sending response:", err);
      alert("Failed to send response");
    }
  };

  const getStatusColor = (status) => {
    return status === "resolved" ? "green" : "orange";
  };

  const getForwardedColor = (isForwarded) => {
    return isForwarded ? "red" : "inherit";
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading complaints...</div>;
  }

  // Separate complaints by status
  const pendingComplaints = complaints.filter(c => c.status !== "resolved");
  const resolvedComplaints = complaints.filter(c => c.status === "resolved");
  const currentComplaints = activeTab === "pending" ? pendingComplaints : resolvedComplaints;

  return (
    <>
      <Header 
        title="Admin Complaints" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <h2>Forwarded Complaints</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "pending" ? "#ff6b35" : "#f8f9fa",
            color: activeTab === "pending" ? "white" : "#333",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ⏳ Pending ({pendingComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab("resolved")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "resolved" ? "#28a745" : "#f8f9fa",
            color: activeTab === "resolved" ? "white" : "#333",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ✅ Resolved ({resolvedComplaints.length})
        </button>
      </div>

      {currentComplaints.length === 0 ? (
        <p>
          {activeTab === "pending" 
            ? "No pending complaints found." 
            : "No resolved complaints found."
          }
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {currentComplaints.map((complaint) => (
            <div 
              key={complaint._id} 
              style={{ 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "15px", 
                backgroundColor: "#f9f9f9" 
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 10px 0", color: getForwardedColor(complaint.isForwarded) }}>
                    Complaint ID: {complaint.complaintId}
                    {complaint.isForwarded && " (Forwarded from SubAdmin)"}
                  </h4>
                  
                  <p style={{ margin: "5px 0" }}>
                    <strong>From:</strong> 
                    {complaint.role === "vendor" 
                      ? `${complaint.userId?.vendorName} (${complaint.userId?.Email})`
                      : `${complaint.userId?.firstName} ${complaint.userId?.lastName} (${complaint.userId?.collegeEmail})`
                    }
                  </p>
                  
                  {complaint.isForwarded && complaint.forwardedBy && (
                    <p style={{ margin: "5px 0" }}>
                      <strong>Forwarded by:</strong> {complaint.forwardedBy.name} 
                      ({complaint.forwardedBy.email})
                      {complaint.forwardedAt && (
                        <span style={{ color: "#666", fontSize: "12px" }}>
                          {" "}on {new Date(complaint.forwardedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  )}
                  
                  <p style={{ margin: "5px 0" }}>
                    <strong>Description:</strong> {complaint.description}
                  </p>
                  
                  <p style={{ margin: "5px 0" }}>
                    <strong>Status:</strong> 
                    <span style={{ color: getStatusColor(complaint.status), fontWeight: "bold" }}>
                      {complaint.status.toUpperCase()}
                    </span>
                  </p>
                  
                  <p style={{ margin: "5px 0" }}>
                    <strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                  
                  {complaint.screenshot && (
                    <div style={{ marginTop: "10px" }}>
                      <strong>Screenshot:</strong>
                      <br />
                      <img 
                        src={complaint.screenshot} 
                        alt="Complaint screenshot" 
                        style={{ maxWidth: "300px", maxHeight: "200px", border: "1px solid #ccc" }}
                      />
                    </div>
                  )}
                  
                  {complaint.response && (
                    <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#e8f5e8", borderRadius: "4px" }}>
                      <strong style={{ color: "#28a745" }}>Admin Response:</strong>
                      <p style={{ margin: "5px 0", fontStyle: "italic" }}>{complaint.response}</p>
                    </div>
                  )}
                  
                  {complaint.assignedAdmins && complaint.assignedAdmins.length > 0 && (
                    <p style={{ margin: "5px 0" }}>
                      <strong>Assigned to:</strong> {complaint.assignedAdmins.map(admin => admin.name).join(", ")}
                    </p>
                  )}
                </div>
                
                <div style={{ marginLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {complaint.status !== "resolved" && (
                    <>
                      {respondingTo === complaint._id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Enter your response..."
                            style={{
                              padding: "8px",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              minWidth: "250px",
                              minHeight: "80px",
                              resize: "vertical"
                            }}
                          />
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleResponse(complaint._id)}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              Send Response
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText("");
                              }}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(complaint._id)}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          💬 Respond
                        </button>
                      )}
                    </>
                  )}
                  
                  {complaint.status === "resolved" && (
                    <span style={{ color: "#28a745", fontWeight: "bold", fontSize: "12px" }}>
                      ✅ Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}

export default AdminComplaints;
