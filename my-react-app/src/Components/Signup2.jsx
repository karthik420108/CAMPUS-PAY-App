import Header3 from './Header3.jsx';
import Footer from './Footer.jsx';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import API_CONFIG from "../config/api";

function Signup2({ Email, PEmail, Pass, role }) {
  const navigate = useNavigate();
  const [Err, setErr] = useState("");
  const [studentOtp, setStudentOtp] = useState(new Array(6).fill(""));
  const [parentOtp, setParentOtp] = useState(new Array(6).fill(""));
  const [theme, setTheme] = useState("light");
  const [resendLoading, setResendLoading] = useState({ student: false, parent: false });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // success, error, warning, info
  const [focusedOtp, setFocusedOtp] = useState({ type: null, index: null });
  const [otpExpiry, setOtpExpiry] = useState({ student: null, parent: null });
  const [timer, setTimer] = useState({ student: 300, parent: 300 }); // 5 minutes in seconds
  const isLight = theme === "light";

  useEffect(() => {
    if (!Email || (role === "student" && !PEmail) || !Pass || !role) navigate('/signup1');
  }, [Email, role, PEmail, Pass, navigate]);
 
  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        const newTimer = { ...prev };
        if (newTimer.student > 0) newTimer.student -= 1;
        if (newTimer.parent > 0) newTimer.parent -= 1;
        return newTimer;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize timers when component mounts
  useEffect(() => {
    setOtpExpiry({
      student: Date.now() + 5 * 60 * 1000, // 5 minutes from now
      parent: Date.now() + 5 * 60 * 1000
    });
    setTimer({ student: 300, parent: 300 });
  }, []);

  const handleChange = (setter, arr, idx, value, idPrefix) => {
    if (/^[0-9]?$/.test(value)) {
      const newArr = [...arr];
      newArr[idx] = value;
      setter(newArr);

      if (value && idx < arr.length - 1) {
        const nextInput = document.getElementById(`${idPrefix}-${idx + 1}`);
        if (nextInput) nextInput.focus();
      }

      if (!value && idx > 0) {
        const prevInput = document.getElementById(`${idPrefix}-${idx - 1}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const studentOtpValue = studentOtp.join("");
    const parentOtpValue = parentOtp.join("");

    if (studentOtpValue.length !== 6 || (role === "student" && parentOtpValue.length !== 6)) {
      setErr("Please enter both 6-digit OTPs");
      return;
    }

    try {
      await axios.post(API_CONFIG.getUrl("/verify-both-otp"), {
        studentEmail: Email,
        parentEmail: PEmail,
        studentOtp: studentOtpValue,
        parentOtp: parentOtpValue,
        role
      });
      navigate('/signup3', { state: { role } });
    } catch (error) {
      setErr(error.response?.data?.message || "OTP verification failed");
    }
  };

  const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async (email, type) => {
    setResendLoading(prev => ({ ...prev, [type]: true }));
    try {
      await axios.post(API_CONFIG.getUrl("/resend-otp"), { email });
      setAlertMessage(`OTP resent to ${email}`);
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      
      // Reset timer for this OTP type
      setTimer(prev => ({ ...prev, [type]: 300 }));
      setOtpExpiry(prev => ({ 
        ...prev, 
        [type]: Date.now() + 5 * 60 * 1000 
      }));
      
      // Clear OTP inputs for this type
      if (type === "student") {
        setStudentOtp(new Array(6).fill(""));
      } else {
        setParentOtp(new Array(6).fill(""));
      }
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to resend OTP");
      setAlertType("error");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setResendLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: isLight
          ? "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%), radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)"
          : "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%), radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%), radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%)"
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-20px);
            opacity: 0;
          }
        }
      `}</style>
      
      <Header3 />
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
        }}
      >
        <form
          onSubmit={handleVerify}
          style={{
            width: "100%",
            maxWidth: 420,
            background: isLight
              ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))"
              : "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
            border: isLight ? "1px solid rgba(148,163,184,0.35)" : "1px solid rgba(148,163,184,0.45)",
            boxShadow: isLight
              ? "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)"
              : "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
            borderRadius: 28,
            padding: "50px 22px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "relative",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: isLight ? "#0f172a" : "#e5e7eb"
          }}
        >
          {/* Accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 22,
              right: 22,
              height: 2,
              borderRadius: 999,
              background: "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)"
            }}
          />

          {/* Theme toggle */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 18,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 6px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
              fontSize: 11,
              zIndex: 5
            }}
          >
            <span style={{ color: "#6b7280" }}>Mode</span>
            <button
              type="button"
              onClick={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "3px 10px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                background: isLight
                  ? "linear-gradient(120deg,#020617,#0f172a)"
                  : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
                color: isLight ? "#e5e7eb" : "#0f172a"
              }}
            >
              {isLight ? "Dark" : "Light"}
            </button>
          </div>

          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            SignUp Page
          </h2>

          {Err && <p style={{ color: "#b91c1c", textAlign: "center", marginBottom: 6 }}>{Err}</p>}

          {/* Student OTP */}
          <label>Enter OTP Sent to Institute Mail</label>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            {studentOtp.map((val, idx) => (
              <input
                key={idx}
                id={`studentOtp-${idx}`}
                type="text"
                maxLength="1"
                value={val}
                onChange={(e) => handleChange(setStudentOtp, studentOtp, idx, e.target.value, "studentOtp")}
                onFocus={() => setFocusedOtp({ type: "student", index: idx })}
                onBlur={() => setFocusedOtp({ type: null, index: null })}
                style={{
                  width: 40,
                  height: 48,
                  fontSize: 20,
                  fontWeight: 600,
                  textAlign: "center",
                  borderRadius: 14,
                  border: focusedOtp.type === "student" && focusedOtp.index === idx
                    ? "2px solid #3b82f6"
                    : "1px solid rgba(148,163,184,0.9)",
                  outline: "none",
                  background: focusedOtp.type === "student" && focusedOtp.index === idx
                    ? (isLight ? "#eff6ff" : "#1e3a8a")
                    : (isLight ? "#ffffff" : "#0f172a"),
                  color: isLight ? "#0f172a" : "#e5e7eb",
                  transform: focusedOtp.type === "student" && focusedOtp.index === idx
                    ? "scale(1.1)"
                    : "scale(1)",
                  transition: "all 0.2s ease",
                  boxShadow: focusedOtp.type === "student" && focusedOtp.index === idx
                    ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                    : "none"
                }}
              />
            ))}
          </div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            {timer.student > 0 ? (
              <p style={{ 
                color: "#6b7280", 
                fontSize: 13, 
                marginBottom: 4 
              }}>
                OTP expires in: {formatTime(timer.student)}
              </p>
            ) : (
              <p style={{ 
                color: "#ef4444", 
                fontSize: 13, 
                marginBottom: 4 
              }}>
                OTP expired
              </p>
            )}
            <p
              onClick={() => !resendLoading.student && handleResend(Email, "student")}
              style={{ 
                cursor: resendLoading.student ? "wait" : "pointer", 
                color: resendLoading.student ? "#94a3b8" : "#3b82f6", 
                fontSize: 13, 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {resendLoading.student ? (
                <>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      border: "2px solid #3b82f6",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Sending...
                </>
              ) : (
                "Resend OTP"
              )}
            </p>
          </div>

          {/* Parent OTP if student */}
          {role === "student" && (
            <>
              <label>Enter OTP Sent to Personal Mail</label>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                {parentOtp.map((val, idx) => (
                  <input
                    key={idx}
                    id={`parentOtp-${idx}`}
                    type="text"
                    maxLength="1"
                    value={val}
                    onChange={(e) => handleChange(setParentOtp, parentOtp, idx, e.target.value, "parentOtp")}
                    onFocus={() => setFocusedOtp({ type: "parent", index: idx })}
                    onBlur={() => setFocusedOtp({ type: null, index: null })}
                    style={{
                      width: 40,
                      height: 48,
                      fontSize: 20,
                      fontWeight: 600,
                      textAlign: "center",
                      borderRadius: 14,
                      border: focusedOtp.type === "parent" && focusedOtp.index === idx
                        ? "2px solid #3b82f6"
                        : "1px solid rgba(148,163,184,0.9)",
                      outline: "none",
                      background: focusedOtp.type === "parent" && focusedOtp.index === idx
                        ? (isLight ? "#eff6ff" : "#1e3a8a")
                        : (isLight ? "#ffffff" : "#0f172a"),
                      color: isLight ? "#0f172a" : "#e5e7eb",
                      transform: focusedOtp.type === "parent" && focusedOtp.index === idx
                        ? "scale(1.1)"
                        : "scale(1)",
                      transition: "all 0.2s ease",
                      boxShadow: focusedOtp.type === "parent" && focusedOtp.index === idx
                        ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                        : "none"
                    }}
                  />
                ))}
              </div>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                {timer.parent > 0 ? (
                  <p style={{ 
                    color: "#6b7280", 
                    fontSize: 13, 
                    marginBottom: 4 
                  }}>
                    OTP expires in: {formatTime(timer.parent)}
                  </p>
                ) : (
                  <p style={{ 
                    color: "#ef4444", 
                    fontSize: 13, 
                    marginBottom: 4 
                  }}>
                    OTP expired
                  </p>
                )}
                <p
                  onClick={() => !resendLoading.parent && handleResend(PEmail, "parent")}
                  style={{ 
                    cursor: resendLoading.parent ? "wait" : "pointer", 
                    color: resendLoading.parent ? "#94a3b8" : "#3b82f6", 
                    fontSize: 13, 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  {resendLoading.parent ? (
                    <>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "2px solid #3b82f6",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Sending...
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            style={{
              padding: "11px 14px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
              color: "#f9fafb",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginTop: 6
            }}
          >
            Verify
          </button>
        </form>
      </main>
      
      {/* Alert Overlay */}
      {showAlert && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            animation: "slideIn 0.3s ease-out"
          }}
          onClick={() => setShowAlert(false)}
        >
          <div
            style={{
              backgroundColor: isLight ? "#ffffff" : "#1f2937",
              color: isLight ? "#1f2937" : "#f9fafb",
              padding: "20px 24px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              maxWidth: "400px",
              width: "90%",
              textAlign: "center",
              border: alertType === "success" 
                ? "2px solid #10b981" 
                : alertType === "error" 
                ? "2px solid #ef4444" 
                : "2px solid #3b82f6"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: alertType === "success" 
                  ? "#10b981" 
                  : alertType === "error" 
                  ? "#ef4444" 
                  : "#3b82f6",
                color: "#ffffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 16px",
                fontSize: "24px",
                fontWeight: "bold"
              }}
            >
              {alertType === "success" ? "✓" : alertType === "error" ? "✕" : "!"}
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "600" }}>
              {alertType === "success" ? "Success" : alertType === "error" ? "Error" : "Info"}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: "1.5" }}>
              {alertMessage}
            </p>
            <button
              onClick={() => setShowAlert(false)}
              style={{
                backgroundColor: alertType === "success" 
                  ? "#10b981" 
                  : alertType === "error" 
                  ? "#ef4444" 
                  : "#3b82f6",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default Signup2;
