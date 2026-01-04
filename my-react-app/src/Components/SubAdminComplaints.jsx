import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SubAdminComplaints({ state }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "resolved"
  const [searchTerm, setSearchTerm] = useState("");
  const [responseModal, setResponseModal] = useState({ isOpen: false, complaintId: null, response: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // Get subAdminId from state or localStorage
      const subAdminId = state?.subAdminId || localStorage.getItem('subAdminId');
      
      if (!subAdminId) {
        console.error("No subAdminId found in state or localStorage");
        alert("SubAdmin ID not found. Please log in again.");
        return;
      }
      
      console.log("Fetching complaints for subAdminId:", subAdminId);
      const res = await axios.get(
        `http://localhost:5000/subadmin/${subAdminId}/complaints`
      );
      console.log("Complaints response:", res.data);
      setComplaints(res.data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (complaintId) => {
    setResponseModal({ isOpen: true, complaintId, response: "" });
  };

  const handleSubmitResponse = async () => {
    if (!responseModal.response.trim()) {
      alert("Please enter a response");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/subadmin/complaint/${responseModal.complaintId}/respond`,
        { response: responseModal.response.trim() }
      );
      alert("Response sent successfully!");
      setResponseModal({ isOpen: false, complaintId: null, response: "" });
      fetchComplaints();
    } catch (err) {
      console.error("Failed to send response:", err);
      alert("Failed to send response");
    }
  };

  const handleForwardToAdmin = async (complaintId) => {
    if (
      !window.confirm(
        "Are you sure you want to forward this complaint to admin?"
      )
    ) {
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/subadmin/complaint/${complaintId}/forward`,
        { subAdminId: state.subAdminId } // Pass the SubAdmin ID for tracking
      );
      alert("Complaint forwarded to admin!");
      fetchComplaints();
    } catch (err) {
      console.error("Failed to forward complaint:", err);
      alert("Failed to forward complaint");
    }
  };

  // Filter complaints based on search term and status
  const filteredComplaints = complaints.filter(complaint => {
    const searchLower = searchTerm.toLowerCase();
    return (
      complaint.studentName?.toLowerCase().includes(searchLower) ||
      complaint.studentEmail?.toLowerCase().includes(searchLower) ||
      complaint.description?.toLowerCase().includes(searchLower) ||
      complaint.complaintId?.toLowerCase().includes(searchLower)
    );
  });
  
  const pendingComplaints = filteredComplaints.filter(c => c.status !== "resolved");
  const resolvedComplaints = filteredComplaints.filter(c => c.status === "resolved");
  const currentComplaints = activeTab === "pending" ? pendingComplaints : resolvedComplaints;

  if (loading) return <p>Loading complaints...</p>;

  return (
    <>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <div
          style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => navigate("/subadmin", { state: { role: "SubAdmin", subAdminId: state?.subAdminId || localStorage.getItem('subAdminId') } })}
          style={{
            padding: "10px 15px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "45px",
            height: "45px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#2563eb";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#3b82f6";
            e.target.style.transform = "translateY(0px)";
          }}
        >
          ←
        </button>
        
        <h2 style={{ margin: 0, color: "#1f2937", textAlign: "center", flex: 1 }}>Complaints</h2>
        
        {/* Search Bar */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px", 
          marginBottom: "20px",
          flex: 1,
          maxWidth: "400px"
        }}>
          <input
            type="text"
            placeholder="Search by student name, email, complaint ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.3s ease"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
            }}
          />
        </div>
      </div>
        <div style={{ display: "flex", gap: "10px" }}>
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
      </div>

      {currentComplaints.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ color: "#6b7280", fontSize: "18px" }}>
            {activeTab === "pending" 
              ? "No pending complaints found" 
              : "No resolved complaints found"
            }
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {currentComplaints.map((complaint) => (
            <div
              key={complaint._id}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        background:
                          complaint.status === "resolved"
                            ? "#10b981"
                            : "#f59e0b",
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {complaint.status.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "#1f2937",
                        fontSize: "16px",
                      }}
                    >
                      {complaint.complaintId}
                    </span>
                  </div>
                  <p style={{ color: "#6b7280", margin: "8px 0" }}>
                    <strong>From:</strong>{" "}
                    {complaint.role === "vendor" 
                      ? `${complaint.userId?.vendorName || 'Unknown Vendor'} (${complaint.userId?.Email || 'No email'})`
                      : `${complaint.userId?.firstName || 'Unknown'} ${complaint.userId?.lastName || ''} (${complaint.userId?.collegeEmail || 'No email'})`
                    }
                  </p>
                  <p style={{ color: "#6b7280", margin: "8px 0" }}>
                    <strong>Date:</strong>{" "}
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ color: "#374151", lineHeight: "1.6" }}>
                  {complaint.description}
                </p>
              </div>

              {complaint.response && (
                <div
                  style={{
                    background: "#ecfdf5",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid #10b981",
                  }}
                >
                  <p style={{ color: "#065f46", fontWeight: "600", marginBottom: "8px" }}>
                    Response from SubAdmin:
                  </p>
                  <p style={{ color: "#065f46", lineHeight: "1.6" }}>
                    {complaint.response}
                  </p>
                </div>
              )}

              {complaint.screenshot && (
                <div style={{ marginBottom: "16px" }}>
                  <img
                    src={complaint.screenshot}
                    alt="Complaint screenshot"
                    style={{
                      maxWidth: "400px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </div>
              )}

              {complaint.status === "active" && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleResponse(complaint._id)}
                    style={{
                      padding: "10px 20px",
                      background: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Send Response
                  </button>
                  <button
                    onClick={() => handleForwardToAdmin(complaint._id)}
                    style={{
                      padding: "10px 20px",
                      background: "#f59e0b",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Forward to Admin
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {responseModal.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
              Send Response to Student
            </h3>
            <textarea
              value={responseModal.response}
              onChange={(e) =>
                setResponseModal({
                  ...responseModal,
                  response: e.target.value,
                })
              }
              placeholder="Enter your response..."
              style={{
                width: "100%",
                height: "120px",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical",
                outline: "none",
                marginBottom: "16px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() =>
                  setResponseModal({
                    isOpen: false,
                    complaintId: null,
                    response: "",
                  })
                }
                style={{
                  padding: "10px 20px",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                style={{
                  padding: "10px 20px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SubAdminComplaints;





