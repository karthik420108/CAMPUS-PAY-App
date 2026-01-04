import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header.jsx";

function AdminMonitorStudents() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }

    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/monitor/students"
      );
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/admin/monitor/student/${studentId}`
      );
      setSelectedStudent(res.data);
      setShowDetails(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFreeze = async (studentId, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/user/${studentId}/freeze`,
        { isFrozen: !currentStatus }
      );
      
      // Refresh the list
      fetchStudents();
      if (selectedStudent && selectedStudent.student._id === studentId) {
        fetchStudentDetails(studentId);
      }
    } catch (err) {
      alert("Failed to update student status");
    }
  };

  const toggleSuspend = async (studentId, currentStatus) => {
    try {
      const reason = currentStatus 
        ? prompt("Enter reason for unsuspending:")
        : prompt("Enter reason for suspension:");
      
      if (reason === null) return; // User cancelled

      await axios.put(
        `http://localhost:5000/admin/monitor/student/${studentId}/suspend`,
        { 
          isSuspended: !currentStatus,
          reason: reason 
        }
      );
      
      // Refresh the list
      fetchStudents();
      if (selectedStudent && selectedStudent.student._id === studentId) {
        fetchStudentDetails(studentId);
      }
    } catch (err) {
      alert("Failed to update student suspend status");
    }
  };

  const handleKycApproval = async (status) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/admin/monitor/student/${selectedStudent.student._id}/kyc`,
        { 
          status: status,
          rejectionReason: status === "rejected" ? rejectionReason : ""
        }
      );
      
      // Refresh the student details
      await fetchStudentDetails(selectedStudent.student._id);
      
      // Close modal and reset
      setShowKycModal(false);
      setRejectionReason("");
      
      alert(`Student KYC ${status} successfully`);
    } catch (err) {
      alert("Failed to update KYC status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
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
        title="Monitor Students" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 16px" }}>
        <h2>Admin – Student Monitor</h2>
        
        {!showDetails ? (
          <>
            {students.length === 0 ? (
              <p>No students found</p>
            ) : (
              <table border="1" cellPadding="10" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Total Spending</th>
                    <th>KYC Status</th>
                    <th>Freeze Status</th>
                    <th>Suspend Status</th>
                    <th>Transactions</th>
                    <th>Complaints</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.collegeEmail}</td>
                      <td>₹{student.totalSpending?.toFixed(4) || 0}</td>
                      <td style={{ color: getStatusColor(student.kyc?.status) }}>
                        {student.kyc?.status || "pending"}
                      </td>
                      <td>
                        <span style={{ 
                          color: student.isFrozen ? "red" : "green",
                          fontWeight: "bold"
                        }}>
                          {student.isFrozen ? "FROZEN" : "ACTIVE"}
                        </span>
                      </td>
                      <td>
                        <span style={{ 
                          color: student.isSuspended ? "red" : "green",
                          fontWeight: "bold"
                        }}>
                          {student.isSuspended ? "SUSPENDED" : "ACTIVE"}
                        </span>
                      </td>
                      <td>{student.totalTransactions || 0}</td>
                      <td>{student.totalComplaints || 0}</td>
                      <td>
                        <button
                          onClick={() => fetchStudentDetails(student._id)}
                          style={{ background: "blue", color: "white", marginRight: "5px" }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => toggleFreeze(student._id, student.isFrozen)}
                          style={{ 
                            background: student.isFrozen ? "green" : "red", 
                            color: "white",
                            marginRight: "5px"
                          }}
                        >
                          {student.isFrozen ? "Unfreeze" : "Freeze"}
                        </button>
                        <button
                          onClick={() => toggleSuspend(student._id, student.isSuspended)}
                          style={{ 
                            background: student.isSuspended ? "green" : "orange", 
                            color: "white"
                          }}
                        >
                          {student.isSuspended ? "Unsuspend" : "Suspend"}
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
            
            {selectedStudent && (
              <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
                <h3>Student Details: {selectedStudent.student.firstName} {selectedStudent.student.lastName}</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <h4>Basic Info</h4>
                    <p><strong>Email:</strong> {selectedStudent.student.collegeEmail}</p>
                    <p><strong>Parent Email:</strong> {selectedStudent.student.parentEmail}</p>
                    <p><strong>Total Spending:</strong> ₹{selectedStudent.student.totalSpending?.toFixed(4) || 0}</p>
                    <p><strong>KYC Status:</strong> 
                      <span style={{ color: getStatusColor(selectedStudent.student.kyc?.status) }}>
                        {selectedStudent.student.kyc?.status || "pending"}
                      </span>
                    </p>
                    <p><strong>Status:</strong> 
                      <span style={{ 
                        color: selectedStudent.student.isFrozen ? "red" : "green",
                        fontWeight: "bold"
                      }}>
                        {selectedStudent.student.isFrozen ? "FROZEN" : "ACTIVE"}
                      </span>
                    </p>
                    <p><strong>Joined:</strong> {new Date(selectedStudent.student.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h4>KYC Information</h4>
                    {selectedStudent.student.kyc?.imageUrl ? (
                      <div>
                        <p><strong>KYC Photo:</strong></p>
                        <img 
                          src={selectedStudent.student.kyc.imageUrl} 
                          alt="KYC Document" 
                          style={{ 
                            width: "200px", 
                            height: "200px", 
                            objectFit: "cover", 
                            cursor: "pointer",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            marginBottom: "10px"
                          }}
                          onClick={() => window.open(selectedStudent.student.kyc.imageUrl, "_blank")}
                        />
                        <p style={{ fontSize: "12px", color: "gray" }}>
                          Click image to view full size
                        </p>
                        {selectedStudent.student.kyc.submittedAt && (
                          <p><strong>Submitted:</strong> {new Date(selectedStudent.student.kyc.submittedAt).toLocaleDateString()}</p>
                        )}
                        {selectedStudent.student.kyc.reviewedAt && (
                          <p><strong>Reviewed:</strong> {new Date(selectedStudent.student.kyc.reviewedAt).toLocaleDateString()}</p>
                        )}
                        {selectedStudent.student.kyc.rejectionReason && (
                          <p><strong>Rejection Reason:</strong> {selectedStudent.student.kyc.rejectionReason}</p>
                        )}
                        
                        {/* KYC Action Buttons */}
                        {selectedStudent.student.kyc?.status === "pending" && (
                          <div style={{ marginTop: "15px" }}>
                            <p><strong>KYC Action:</strong></p>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button
                                onClick={() => handleKycApproval("verified")}
                                style={{
                                  background: "green",
                                  color: "white",
                                  padding: "8px 16px",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer"
                                }}
                              >
                                ✅ Approve KYC
                              </button>
                              <button
                                onClick={() => setShowKycModal(true)}
                                style={{
                                  background: "red",
                                  color: "white",
                                  padding: "8px 16px",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer"
                                }}
                              >
                                ❌ Reject KYC
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: "gray" }}>No KYC photo submitted</p>
                    )}
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <h4>Statistics</h4>
                    <p><strong>Total Transactions:</strong> {selectedStudent.stats.totalTransactions}</p>
                    <p><strong>Total Complaints:</strong> {selectedStudent.stats.totalComplaints}</p>
                    <p><strong>Total Spending:</strong> ₹{selectedStudent.stats.totalSpending?.toFixed(4) || 0}</p>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <h4>Recent Transactions (Last 5)</h4>
                    {selectedStudent.transactions.length === 0 ? (
                      <p>No transactions</p>
                    ) : (
                      <table border="1" cellPadding="5" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th>Vendor ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.transactions.slice(-5).reverse().map((tx, index) => (
                            <tr key={index}>
                              <td>{tx.vendorid}</td>
                              <td>₹{tx.amount}</td>
                              <td style={{ color: tx.status === "SUCCESS" ? "green" : "red" }}>
                                {tx.status}
                              </td>
                              <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  
                  <div>
                    <h4>Recent Complaints (Last 5)</h4>
                    {selectedStudent.complaints.length === 0 ? (
                      <p>No complaints</p>
                    ) : (
                      <table border="1" cellPadding="5" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th>Complaint ID</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.complaints.slice(0, 5).map((complaint, index) => (
                            <tr key={index}>
                              <td>{complaint.complaintId}</td>
                              <td>{complaint.description.substring(0, 30)}...</td>
                              <td style={{ color: complaint.status === "resolved" ? "green" : "orange" }}>
                                {complaint.status}
                              </td>
                              <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
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

      {/* KYC Rejection Modal */}
      {showKycModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "400px",
            maxWidth: "500px"
          }}>
            <h3>Reject KYC</h3>
            <p>Please provide a reason for rejecting this KYC:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: "100%",
                height: "100px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginBottom: "15px",
                resize: "vertical"
              }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowKycModal(false);
                  setRejectionReason("");
                }}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ccc",
                  backgroundColor: "white",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleKycApproval("rejected")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Reject KYC
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminMonitorStudents;
