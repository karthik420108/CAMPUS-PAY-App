import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";

function FreezeUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate(-1);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/users");
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [state, navigate]);

  const handleFreezeToggle = async (userId, currentFreezeStatus) => {
    try {
      await axios.put(`http://localhost:5000/user/${userId}/freeze`, {
        isFrozen: !currentFreezeStatus
      });
      
      // Refresh users list
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data);
      
      alert(`User ${!currentFreezeStatus ? 'frozen' : 'unfrozen'} successfully!`);
    } catch (err) {
      console.error("Error updating freeze status:", err);
      alert("Failed to update freeze status");
    }
  };

  const handleFreezeAll = async () => {
    if (!window.confirm("Are you sure you want to freeze ALL users? This will prevent all users from accessing their accounts.")) {
      return;
    }

    try {
      // Get all unfrozen users
      const unfrozenUsers = users.filter(user => !user.isFrozen);
      
      if (unfrozenUsers.length === 0) {
        alert("All users are already frozen!");
        return;
      }

      // Freeze all users in parallel
      await Promise.all(
        unfrozenUsers.map(user => 
          axios.put(`http://localhost:5000/user/${user._id}/freeze`, {
            isFrozen: true
          })
        )
      );
      
      // Refresh users list
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data);
      
      alert(`Successfully frozen ${unfrozenUsers.length} users!`);
    } catch (err) {
      console.error("Error freezing all users:", err);
      alert("Failed to freeze all users");
    }
  };

  const handleUnfreezeAll = async () => {
    if (!window.confirm("Are you sure you want to unfreeze ALL users? This will allow all users to access their accounts.")) {
      return;
    }

    try {
      // Get all frozen users
      const frozenUsers = users.filter(user => user.isFrozen);
      
      if (frozenUsers.length === 0) {
        alert("All users are already active!");
        return;
      }

      // Unfreeze all users in parallel
      await Promise.all(
        frozenUsers.map(user => 
          axios.put(`http://localhost:5000/user/${user._id}/freeze`, {
            isFrozen: false
          })
        )
      );
      
      // Refresh users list
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data);
      
      alert(`Successfully unfrozen ${frozenUsers.length} users!`);
    } catch (err) {
      console.error("Error unfreezing all users:", err);
      alert("Failed to unfreeze all users");
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.collegeEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading users...</div>;
  }

  return (
    <>
      <Header 
        title="Freeze Users" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <h2>Freeze/Unfreeze Users</h2>

      {/* Search Bar and Bulk Actions */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "15px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px"
          }}
        />
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleFreezeAll}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            🥶 Freeze All
          </button>
          
          <button
            onClick={handleUnfreezeAll}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            🔥 Unfreeze All
          </button>
        </div>
      </div>

      {/* Users List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          filteredUsers.map((user) => (
            <div 
              key={user._id} 
              style={{ 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "15px", 
                backgroundColor: "#f9f9f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 5px 0" }}>
                  {user.firstName} {user.lastName}
                </h4>
                <p style={{ margin: "5px 0", color: "#666" }}>
                  {user.collegeEmail}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  Wallet Balance: ₹{user.walletBalance || 0}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor: user.isFrozen ? "#dc3545" : "#28a745",
                  color: "white"
                }}>
                  {user.isFrozen ? "FROZEN" : "ACTIVE"}
                </span>
                
                <button
                  onClick={() => handleFreezeToggle(user._id, user.isFrozen)}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    backgroundColor: user.isFrozen ? "#28a745" : "#dc3545",
                    color: "white"
                  }}
                >
                  {user.isFrozen ? "Unfreeze" : "Freeze"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div style={{ 
        marginTop: "30px", 
        padding: "15px", 
        backgroundColor: "#e9ecef", 
        borderRadius: "8px" 
      }}>
        <h4 style={{ margin: "0 0 10px 0" }}>Summary</h4>
        <p style={{ margin: "5px 0" }}>
          Total Users: {users.length}
        </p>
        <p style={{ margin: "5px 0", color: "#28a745" }}>
          Active Users: {users.filter(u => !u.isFrozen).length}
        </p>
        <p style={{ margin: "5px 0", color: "#dc3545" }}>
          Frozen Users: {users.filter(u => u.isFrozen).length}
        </p>
      </div>
      </div>
    </>
  );
}

export default FreezeUsers;
