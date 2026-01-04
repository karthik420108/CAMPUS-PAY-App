import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SubAdminProfile({ state }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    imageUrl: "",
  });
  const [isEditing, setIsEditing] = useState(state?.editMode || false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const subAdminId = state?.subAdminId || localStorage.getItem("subAdminId");
      if (!subAdminId) {
        alert("SubAdmin ID not found. Please log in again.");
        navigate("/");
        return;
      }
      const res = await axios.get(
        `http://localhost:5000/subadmin/${subAdminId}/profile`
      );
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/upload/subadmin",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProfile({ ...profile, imageUrl: res.data.url });
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const subAdminId = state?.subAdminId || localStorage.getItem("subAdminId");
      await axios.put(`http://localhost:5000/subadmin/${subAdminId}/profile`, profile);
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() =>
            navigate("/subadmin", {
              state: {
                role: "SubAdmin",
                subAdminId: state?.subAdminId || localStorage.getItem("subAdminId"),
              },
            })
          }
          style={{
            padding: "10px 15px",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, color: "#1f2937" }}>
          {isEditing ? "Edit Profile" : "Profile"}
        </h2>
        <div style={{ width: "45px" }}></div>
      </div>

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={profile.name}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #e5e7eb",
                marginBottom: "20px",
              }}
            />
          ) : (
            <div
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "48px",
                color: "#9ca3af",
              }}
            >
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          {isEditing && (
            <label
              style={{
                padding: "8px 16px",
                background: "#4f46e5",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "16px",
                }}
              />
            ) : (
              <p style={{ margin: 0, color: "#6b7280", fontSize: "16px" }}>{profile.name}</p>
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
              Email
            </label>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "16px" }}>{profile.email}</p>
          </div>

          {isEditing && (
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={handleSave}
                style={{
                  padding: "12px 24px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                style={{
                  padding: "12px 24px",
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubAdminProfile;
