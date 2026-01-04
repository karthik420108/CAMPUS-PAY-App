import React, { useState } from "react";
import "./Header1.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Header1 = ({ isOp, userId, isFrozen , role}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  console.log("Header1 - isFrozen:", isFrozen);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    isOp(!isOpen);
  };
  console.log(role);
  async function SHome() {
    try {
      // ✅ correct route
      if(role == "student"){
      const res = await axios.post(`http://localhost:5000/info/${userId}`);

      const {
        username,
        userId: uid,
        isFrozen,
        imageUrl,
        walletBalance,
        userCreatedAt,
      } = res.data;

      // ✅ institute balance (prefer GET, but keeping yours)
      const res2 = await axios.post(
        "http://localhost:5000/institute-balance"
      );

      navigate("/login", {
        state: {
          username,
          userId: uid,
          isFrozen,
          imageUrl,
          walletBalance,
          userCreatedAt,
          instBalance: res2.data.balance,
        },
      });
    }
    else if(role == "subadmin"){
      // Get subadmin profile info
      const res = await axios.post(`http://localhost:5000/subadmin-info/${userId}`);
      
      const {
        username,
        userId: uid,
        imageUrl,
        createdAt,
      } = res.data;

      navigate("/admin", {
        state: {
          username,
          userId: uid,
          imageUrl,
          createdAt,
        },
      });
    }
    else{
      navigate("/vlogin" , {state : {vendorId : userId}})
    }
    } catch (err) {
      console.error("Home navigation failed:", err);
    }
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <ul>
          <li onClick={SHome}>🏠 Home</li>

          <li
            className={isFrozen ? "disabled" : ""}
            onClick={() => {
              if (!isFrozen && role == "student"){
                navigate("/History", { state: { userId , role} });
              }
              else {
              navigate("/vendor-transaction", {state : {userId , role}});
            }
            }
            
          } 
          >
            📊 Transaction History
          </li>
          {role == "vendor" && <li onClick={() => navigate("/redeem" , { state: { vendorId : userId } })}>Redeem</li>}
          {role == "vendor" && <li onClick={()=>navigate("/redeem-history", { state: { vendorId : userId } })}>Redeem History</li>}
          <li onClick={() => navigate("/complaint-history", { state: { userId , role , isFrozen} })}>
            💼 View Complaint History
          </li>

          {role == "student" &&<li onClick={() => navigate("/generate-bill", { state: { userId , isFrozen} })}>
            📄 Generate Bill
          </li>}

          <li onClick={() => navigate("/raise-complaint", { state: { userId , role , isFrozen } })}>
            ❓ Raise a Complaint
          </li>
          <li onClick={() => navigate("/")}>
            Logout
          </li>
        </ul>
      </div>

      {/* Floating Hamburger */}
      <div className="hamburger" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </>
  );
};

export default Header1;

