import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header.jsx";

function AdminRedeemRequests() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [redeems, setRedeems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/");
      return;
    }

    fetchRedeems();
  }, []);

  const fetchRedeems = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/admin/redeem-requests"
      );
      setRedeems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (redeemId, status) => {
    try {
      console.log(redeemId , status)
      await axios.post(
        "http://localhost:5000/admin/redeem/update-status",
        { redeemId, status }
      );

      // remove item from UI after action
      setRedeems((prev) =>
        prev.filter((r) => r._id !== redeemId)
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header 
        title="Redeem Requests" 
        userRole="admin" 
        userName="Admin" 
      />
      
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <h2>Admin – Redeem Requests</h2>
      
      {redeems.length === 0 ? (
        <p>No pending redeem requests</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Amount</th>
              <th>IFSC</th>
              <th>Account</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {redeems.map((r) => (
              <tr key={r._id}>
                <td>{r.userId?.vendorName}</td>
                <td>₹{r.amount}</td>
                <td>{r.Ifsc}</td>
                <td>{r.Acc}</td>
                <td>{new Date(r.date).toLocaleString()}</td>

                <td>
                  <button
                    onClick={() => updateStatus(r._id, "SUCCESS")}
                    style={{ background: "green", color: "white" }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(r._id, "FAILED")}
                    style={{
                      background: "red",
                      color: "white",
                      marginLeft: "10px",
                    }}
                  >
                    Reject
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

export default AdminRedeemRequests;
