import { useNavigate } from "react-router-dom";
import Header3 from "./Header3.jsx";
import "./RoleSelect.css";

function RoleSelect({setRole}) {
  const navigate = useNavigate();

  const chooseRole = (role) => {
    setRole(role);
    navigate("/signup1");
  };

  return (
    <>
      <Header3 />
      <div className="role-container">
        <h2>How will you use the app?</h2>

      <button onClick={() => chooseRole("student")}>
        🎓 I’m a Student
      </button>

      <button onClick={() => chooseRole("vendor")}>
        🏪 I’m a Vendor
      </button>
    </div>
    </>
  );
}

export default RoleSelect;
