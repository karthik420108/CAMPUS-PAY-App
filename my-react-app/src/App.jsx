import React from "react";
import "./App.css";
import Start from "./Components/Start.jsx";
import SignUp1 from "./Components/Signup1.jsx";
import Signup2 from "./Components/Signup2.jsx";
import Signup3 from "./Components/Signup3.jsx";
import Login from "./Components/Login.jsx";
import History from "./Components/History.jsx";
import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Upin from "./Components/Upin.jsx";
import Forgot from "./Components/Forgot.jsx";
import Forgot2 from "./Components/Forgot2.jsx";
import PaymentCard from "./Components/PaymentCard.jsx";
import Payment from "./Components/Payment.jsx";
import RaiseComplaint from "./Components/RaiseComplaint.jsx";
import ComplaintSuccess from "./Components/ComplaintSuccess.jsx";
import ComplaintHistory from "./Components/complaintHistory.jsx";
import Kyc from "./Components/kyc.jsx";
import GenerateBill from "./Components/GenerateBill.jsx";
import EnterMpin from "./Components/EnterMpin.jsx";
import ResetPassword from "./Components/ResetPassword.jsx";
import ForgotMpinOtp from "./Components/ForgotMpinOtp.jsx";
import ResetMpin from "./Components/ResetMpin.jsx";
import EditProfile from "./Components/EditProfile.jsx";
import RoleSelect from "./Components/Roleselect.jsx";
import VendorLogin from "./Components/VendorLogin.jsx";
import GenerateQR from "./Components/GenerateQr.jsx";
import RedeemHistoryButton from "./Components/Reedemhistory.jsx";
import RedeemForm from "./Components/Redeem.jsx";
import ChangeMpin from "./Components/ChangeMpin.jsx";
import VendorChangeMpin from "./Components/VendorChangeMpin.jsx";



import VendorTransactions from "./Components/VenorTransaction.jsx";
import VendorEditProfile from "./Components/VendorEditProfile.jsx";
import Notifications from "./Components/Notifications.jsx";
import TransactionDetails from "./Components/TranasactionDetails.jsx";
import ViewvProfile from "./Components/ViewvProfile.jsx";
import Refund from "./Components/Refund.jsx";
import AdminLogin from "./Components/AdminLogin";
import AddFunds from "./Components/AddFunds.jsx";
import AdminRedeemRequests from "./Components/RedeemRequests.jsx";
import AdminNotifications from "./Components/AddNotifications.jsx";
import MonitorSubadmins from "./Components/MonitorSubadmins.jsx";
import SubAdminDashboard from "./Components/SubAdminDashboard.jsx";
import AdminComplaints from "./Components/AdminComplaints.jsx";
import AdminVendorKYC from "./Components/AdminVendorKYC.jsx";
import AdminVendorComplaints from "./Components/AdminVendorComplaints.jsx";
import FreezeUsers from "./Components/FreezeUsers.jsx";
import AdminMonitorVendors from "./Components/AdminMonitorVendors.jsx";
import AdminMonitorStudents from "./Components/AdminMonitorStudents.jsx";
import SubAdminComplaints from "./Components/SubAdminComplaints.jsx";
import SubAdminStudents from "./Components/SubAdminStudents.jsx";
import SubAdminProfile from "./Components/SubAdminProfile.jsx";
import SubAdminEdit from "./Components/SubAdminEdit.jsx";
import SubAdminNotificationSystem from "./Components/SubAdminNotificationSystem.jsx";


function App() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const [Pass, setPass] = useState("");
  const [Email, setEmail] = useState("");
  const [PEmail, setPEmail] = useState("");
  const [Fname, setFname] = useState("");
  const [Lname, setLname] = useState("");
  const [Mpin, setMpin] = useState("");
  const [Iurl, setIurl] = useState("");
  const [otp1, setOtp1] = useState("");
  const [otp2, setOtp2] = useState("");
  const [role , setRole] = useState(""); 
  const[Acc , setAcc] = useState(""); 
  const [Ifsc , setIfsc] = useState("");

  return (
    <>
      <Routes>
        <Route path = "/rrequests" element = {<AdminRedeemRequests/>}/>
        <Route path="/" element={<Start />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path = "/monitor-subadmins" element = {<MonitorSubadmins/>}/>
        <Route path = "/admin-complaints" element = {<AdminComplaints/>}/>
        <Route path = "/admin-vendor-kyc" element = {<AdminVendorKYC/>}/>
        <Route path = "/admin-vendor-complaints" element = {<AdminVendorComplaints/>}/>
        <Route path = "/freeze-users" element = {<FreezeUsers/>}/>
        <Route path = "/admin-monitor-vendors" element = {<AdminMonitorVendors/>}/>
        <Route path = "/admin-monitor-students" element = {<AdminMonitorStudents/>}/>
        <Route path = "/subadmin" element = {<SubAdminDashboard/>}/>
        <Route path = "/subadmin-complaints" element = {<SubAdminComplaints/>}/>
        <Route path = "/subadmin-students" element = {<SubAdminStudents/>}/>
        <Route path = "/subadmin-profile" element = {<SubAdminProfile/>}/>
        <Route path = "/subadmin-edit" element = {<SubAdminEdit/>}/>
        <Route path = "/subadmin-notification-system" element = {<SubAdminNotificationSystem/>}/>
        <Route path = "/vendor-transaction" element = {<VendorTransactions/>}/>

        {/* Signup Flow */}
        <Route
          path="/signup1"
          element={
            <SignUp1
              setEmail={setEmail}
              setPEmail={setPEmail}
              setPass={setPass}
              Email={Email}
              Pass={Pass}
              PEmail={PEmail}
              setOtp1={setOtp1}
              setOtp2={setOtp2}
              role={role}
            />
          }
        />
        <Route path = "/add-funds" element = {<AddFunds/>}/>
        <Route path = "/notifications" element = {<Notifications/>}/>
        <Route path="/vlogin" element={<VendorLogin />} />
        <Route path="/vendor-change-mpin" element={<VendorChangeMpin />} />
        <Route path="/generate-bill" element={<GenerateBill />} />

        <Route path="/role-select" element={<RoleSelect setRole={setRole} />} />
        <Route path = "/add-notifications" element = {<AdminNotifications/>}/>
        
          <Route path="/signup2"

          element={
            <Signup2
              Email={Email}
              PEmail={PEmail}
              Pass={Pass}
              otp1={otp1}
              otp2={otp2}
              setOtp1={setOtp1}
              setOtp2={setOtp2}
              role={role}
            />
          }
        />
        <Route
   path="/transaction/:txid"
   element={<TransactionDetails />}
  />

        <Route path = "/redeem-history" element={<RedeemHistoryButton />} />
        <Route path="/generate-qr" element={<GenerateQR />} />

        <Route path="/edit-profile" element={<EditProfile />} />

        <Route path="/change-mpin" element={<ChangeMpin />} />

        <Route path="/reset-mpin" element={<ResetMpin />} />

        <Route path="/redeem" element={<RedeemForm />} />
        <Route
          path="/forgot-mpin"
          element={<ForgotMpinOtp />}
        />
        <Route
          path="/signup3"
          element={
          
                
                <Signup3
                  Email={Email}
                  PEmail={PEmail}
                  Pass={Pass}
                  setFname={setFname}
                  setLname={setLname}
                  setIurl={setIurl}
                  role={role}
                  setAcc={setAcc}
                  setIfsc={setIfsc}
                />
          }
        />
        <Route path = "/viewv" element = {<ViewvProfile/>}/>
        <Route
          path="/mpin"
          element={
            <Upin
              Email={Email}
              PEmail={PEmail}
              Pass={Pass}
              Fname={Fname}
              Lname={Lname}
              Iurl={Iurl}
              setMpin={setMpin}
              Mpin={Mpin}
              role={role}
              Acc = {Acc}
              Ifsc = {Ifsc}
            />
          }
        />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/forgot2" element={<Forgot2 />} />
        {/* setMpin  , Email , Fname , Lname , Mpin , Iurl , PEmail , Pass */}
        <Route
          path="/login"
          element={<Login isOpen={isOpen} toggleSidebar={toggleSidebar} />}
        />
        <Route path="/History" element={<History />} />

        <Route path="/raise-complaint" element={<RaiseComplaint />} />

        <Route path="/payment-card" element={<PaymentCard />} />
        <Route path="/payment-mid" element={<Payment />} />
        <Route path="/complaint-success" element={<ComplaintSuccess />} />
        <Route path="/complaint-history" element={<ComplaintHistory />} />
        <Route path="/kyc" element={
          <Kyc role = {role} Email = {Email}/>
        } />
        <Route path="/enter-mpin" element={<EnterMpin />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/vendor-edit-profile" element={<VendorEditProfile />} />
        <Route path = "/refund" element={<Refund/>}></Route>
      </Routes>
    </>
  );
}

export default App;
