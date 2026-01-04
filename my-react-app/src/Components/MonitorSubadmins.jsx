import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header.jsx";

function MonitorSubadmins() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubAdmin, setNewSubAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }

    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:5000/subadmins");
      setSubAdmins(res.data);
    } catch (err) {
      console.error("Failed to fetch subadmins:", err);
      alert("Failed to load subadmins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/subadmin/add", {
        name: newSubAdmin.name,
        email: newSubAdmin.email,
        password: newSubAdmin.password,
      });

      alert("SubAdmin added successfully!");
      setNewSubAdmin({ name: "", email: "", password: "" });
      setShowAddForm(false);
      fetchSubAdmins(); // Refresh the list
    } catch (err) {
      console.error("Failed to add subadmin:", err);
      alert(err.response?.data?.message || "Failed to add subadmin");
    }
  };

  const handleDeleteSubAdmin = async (subAdminId) => {
    if (!window.confirm("Are you sure you want to remove this subadmin?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/subadmin/${subAdminId}`);
      alert("SubAdmin removed successfully!");
      fetchSubAdmins(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete subadmin:", err);
      alert(err.response?.data?.message || "Failed to remove subadmin");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header 
        title="Monitor Subadmins" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <h2>Monitor Subadmins</h2>

      <button
        onClick={() => setShowAddForm(!showAddForm)}
        style={{
          background: "#51cf66",
          color: "white",
          border: "none",
          padding: "10px 20px",
          cursor: "pointer",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        {showAddForm ? "Cancel" : "+ Add New SubAdmin"}
      </button>

      {showAddForm && (
        <form
          onSubmit={handleAddSubAdmin}
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            marginBottom: "20px",
            borderRadius: "4px",
            maxWidth: "400px",
          }}
        >
          <h3>Add New SubAdmin</h3>
          <div style={{ marginBottom: "10px" }}>
            <label>
              Name:
              <input
                type="text"
                value={newSubAdmin.name}
                onChange={(e) =>
                  setNewSubAdmin({ ...newSubAdmin, name: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>
              Email:
              <input
                type="email"
                value={newSubAdmin.email}
                onChange={(e) =>
                  setNewSubAdmin({ ...newSubAdmin, email: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>
              Password:
              <input
                type="password"
                value={newSubAdmin.password}
                onChange={(e) =>
                  setNewSubAdmin({ ...newSubAdmin, password: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  boxSizing: "border-box",
                }}
              />
            </label>
          </div>
          <button
            type="submit"
            style={{
              background: "#51cf66",
              color: "white",
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Add SubAdmin
          </button>
        </form>
      )}

      {subAdmins.length === 0 ? (
        <p>No subadmins found</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", marginTop: "20px" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total Complaints</th>
              <th>Resolved Complaints</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {subAdmins.map((subAdmin) => (
              <tr key={subAdmin._id}>
                <td>
                  {subAdmin.imageUrl && (
                    <img
                      src={subAdmin.imageUrl}
                      alt={subAdmin.name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "10px",
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                  {subAdmin.name || "N/A"}
                </td>
                <td>{subAdmin.email || "N/A"}</td>
                <td>{subAdmin.complaintsCount || 0}</td>
                <td>
                  <span
                    style={{
                      color: subAdmin.resolvedComplaintsCount > 0 ? "#51cf66" : "#999",
                      fontWeight: "bold",
                    }}
                  >
                    {subAdmin.resolvedComplaintsCount || 0}
                  </span>
                </td>
                <td>
                  {subAdmin.createdAt
                    ? new Date(subAdmin.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteSubAdmin(subAdmin._id)}
                    style={{
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
    </>
  );
}

export default MonitorSubadmins;
