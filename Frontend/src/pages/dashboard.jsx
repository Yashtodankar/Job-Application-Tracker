import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Job Application Tracker 📋</h1>
        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
      <p>Welcome! You are logged in successfully. 🎉</p>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Dashboard;