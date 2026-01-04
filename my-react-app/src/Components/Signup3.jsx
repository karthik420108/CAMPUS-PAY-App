import Header3 from "./Header3.jsx";
import Footer from "./Footer.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const characters = [
  { id: 1, src: "/characters/boy.png", label: "Boy" },
  { id: 2, src: "/characters/girl.png", label: "Girl" },
  { id: 3, src: "/characters/student-boy.png", label: "Student Boy" },
  { id: 4, src: "/characters/student-girl.png", label: "Student Girl" },
  { id: 5, src: "/characters/professional-man.png", label: "Professional" },
];

function Signup3({
  Email,
  setFname,
  setLname,
  setIurl,
  PEmail,
  Pass,
  role,
  setIfsc,
  setAcc,
}) {
  const navigate = useNavigate();

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");

  const isLight = theme === "light";

  useEffect(() => {
    if (!role) navigate("/role-select");
    if (!Email || (role === "student" && (!PEmail || !Pass))) {
      navigate("/Signup1");
    }
  }, [Email, PEmail, Pass, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target;
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const accNo = form.accNo?.value.trim();
    const ifsc = form.ifsc?.value.trim();

    if (role === "vendor") {
      if (!accNo || !ifsc) {
        setError("Account Number and IFSC are required for vendors");
        setLoading(false);
        return;
      }
      setAcc(accNo);
      setIfsc(ifsc);
    }

    if (!uploadedFile && !selectedCharacter) {
      setError("Please upload a photo OR choose a character");
      setLoading(false);
      return;
    }

    if (uploadedFile && selectedCharacter) {
      setError("Please choose only one option");
      setLoading(false);
      return;
    }

    setFname(firstName);
    setLname(lastName);

    try {
      if (selectedCharacter) {
        setIurl(selectedCharacter);
        navigate("/kyc", { state: { role } });
        return;
      }

      const formData = new FormData();
      formData.append("role", role + "pics");
      formData.append("profileImage", uploadedFile);
      formData.append("email", Email);

      const res = await axios.post("http://localhost:5000/upload", formData);

      setIurl(res.data.url);
      navigate("/kyc", { state: { role } });
    } catch {
      setError("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: isLight
          ? "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%), radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)"
          : "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%), radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%), radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%)"
      }}
    >
      <Header3 />

      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        {/* ✅ ONLY ONE FORM */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 480,
            background: isLight
              ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))"
              : "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
            border: isLight
              ? "1px solid rgba(148,163,184,0.35)"
              : "1px solid rgba(148,163,184,0.45)",
            boxShadow: isLight
              ? "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)"
              : "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
            borderRadius: 28,
            padding: "50px 22px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: isLight ? "#0f172a" : "#e5e7eb",
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
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
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
              zIndex: 5,
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
                color: isLight ? "#e5e7eb" : "#0f172a",
              }}
            >
              {isLight ? "Dark" : "Light"}
            </button>
          </div>

          <h2
            style={{
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Choose Profile
          </h2>

          {/* File input */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (!e.target.files?.[0]) return;
              setUploadedFile(e.target.files[0]);
              setSelectedCharacter(null);
            }}
            style={{
              padding: 10,
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.9)",
              background: isLight ? "#fff" : "#0f172a",
              color: isLight ? "#0f172a" : "#e5e7eb",
            }}
          />

          <p style={{ textAlign: "center", margin: "10px 0", fontWeight: 500 }}>
            OR
          </p>

          {/* Character grid */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() =>
                  uploadedFile ? null : setSelectedCharacter(char.src)
                }
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 14,
                  border:
                    selectedCharacter === char.src
                      ? "3px solid #0ea5e9"
                      : "1px solid rgba(148,163,184,0.5)",
                  opacity: uploadedFile ? 0.5 : 1,
                  cursor: uploadedFile ? "not-allowed" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={char.src}
                  alt={char.label}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </div>
            ))}
          </div>

          {error && (
            <p style={{ color: "#b91c1c", textAlign: "center" }}>{error}</p>
          )}

          {/* INPUTS (DIV, NOT FORM) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              name="firstName"
              placeholder="First Name"
              required
              style={{
                padding: 10,
                borderRadius: 14,
                border: "1px solid rgba(148,163,184,0.9)",
                background: isLight ? "#fff" : "#0f172a",
                color: isLight ? "#0f172a" : "#e5e7eb",
              }}
            />

            <input
              name="lastName"
              placeholder="Last Name"
              required
              style={{
                padding: 10,
                borderRadius: 14,
                border: "1px solid rgba(148,163,184,0.9)",
                background: isLight ? "#fff" : "#0f172a",
                color: isLight ? "#0f172a" : "#e5e7eb",
              }}
            />

            {role === "vendor" && (
              <>
                <input
                  name="accNo"
                  placeholder="Account Number"
                  required
                  style={{
                    padding: 10,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.9)",
                    background: isLight ? "#fff" : "#0f172a",
                    color: isLight ? "#0f172a" : "#e5e7eb",
                  }}
                />

                <input
                  name="ifsc"
                  placeholder="IFSC Code"
                  required
                  style={{
                    padding: 10,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.9)",
                    background: isLight ? "#fff" : "#0f172a",
                    color: isLight ? "#0f172a" : "#e5e7eb",
                  }}
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 14px",
                borderRadius: 14,
                border: "none",
                background:
                  "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
                color: "#f9fafb",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
                marginTop: 6,
              }}
            >
              {loading ? "Processing..." : "Next"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Signup3;
