import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [alertMsg, setAlertMsg] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [selectAll, setSelectAll] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // ✅ Perfect hospital background (clean & professional)
  const backgroundImage =
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1600&q=80";


  // 🔐 Handle unauthorized access
  const handleUnauthorized = (res) => {
    if (res.status === 401) {
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
      return true;
    }
    return false;
  };

  // Fetch users
  useEffect(() => {
    fetch("http://127.0.0.1:5000/admin/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    })
      .then((res) => {
        if (handleUnauthorized(res)) return;
        return res.json();
      })
      .then((data) => setUsers(data?.users || []))
      .catch(() =>
        setStatusMsg({ type: "error", text: "Failed to load users" })
      )
      .finally(() => setLoadingUsers(false));
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectEmail = (email) => {
    setSelectedEmails((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails([]);
      setSelectAll(false);
    } else {
      setSelectedEmails(filteredUsers.map((u) => u.email));
      setSelectAll(true);
    }
  };

  const sendAlert = async () => {
    if (!alertMsg || selectedEmails.length === 0) {
      setStatusMsg({
        type: "error",
        text: "Enter alert message and select recipients",
      });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/admin/send_alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ emails: selectedEmails, message: alertMsg }),
      });

      if (handleUnauthorized(res)) return;

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: "success", text: "Alert sent successfully" });
        setAlertMsg("");
        setSelectedEmails([]);
        setSelectAll(false);
      } else {
        setStatusMsg({ type: "error", text: data.message });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Server error" });
    } finally {
      setSending(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      {/* Medical blue overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,70,140,0.65), rgba(0,0,0,0.5))",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "30px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#0d47a1",
            color: "#fff",
            padding: "18px 26px",
            borderRadius: "14px",
            marginBottom: "25px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Hospital Admin Dashboard</h2>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
              Emergency Alert Management System
            </p>
          </div>

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <span
              style={{ cursor: "pointer", fontWeight: "600" }}
              onClick={() => setShowProfile(!showProfile)}
            >
              Admin ▾
            </span>

            {showProfile && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "32px",
                  background: "#fff",
                  color: "#000",
                  borderRadius: "10px",
                  padding: "12px",
                  width: "200px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                }}
              >
                <p style={{ margin: "0 0 10px", fontSize: "14px" }}>
                  hospitaladmin@gmail.com
                </p>
                <button
                  onClick={logout}
                  style={{
                    width: "100%",
                    padding: "9px",
                    background: "#0d47a1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
            gap: "18px",
            marginBottom: "25px",
          }}
        >
          {[
            { label: "Total Users", value: users.length },
            { label: "Selected Recipients", value: selectedEmails.length },
            { label: "Alerts Prepared", value: alertMsg ? 1 : 0 },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: "#ffffff",
                padding: "22px",
                borderRadius: "14px",
                boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: 0, color: "#0d47a1" }}>{card.value}</h2>
              <p style={{ margin: 0, color: "#555" }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            background: "#ffffff",
            padding: "28px",
            borderRadius: "16px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          }}
        >
          {statusMsg.text && (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                borderRadius: "8px",
                background:
                  statusMsg.type === "success" ? "#e8f5e9" : "#fdecea",
                color:
                  statusMsg.type === "success" ? "#1b5e20" : "#b71c1c",
                fontWeight: "600",
              }}
            >
              {statusMsg.text}
            </div>
          )}

          <textarea
            value={alertMsg}
            onChange={(e) => setAlertMsg(e.target.value)}
            placeholder="Type emergency alert message..."
            rows={3}
            style={{ width: "100%", padding: "12px", marginBottom: "12px" }}
          />

          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />

          <div style={{ marginBottom: "10px", fontWeight: "600" }}>
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />{" "}
            Select All ({filteredUsers.length})
          </div>

          <div
            style={{
              maxHeight: "280px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "14px",
            }}
          >
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.email} style={{ marginBottom: "8px" }}>
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(u.email)}
                    onChange={() => handleSelectEmail(u.email)}
                  />{" "}
                  <strong>{u.name}</strong>{" "}
                  <span style={{ color: "#666" }}>({u.email})</span>
                </div>
              ))
            )}
          </div>

          <button
            onClick={sendAlert}
            disabled={sending}
            style={{
              padding: "13px 28px",
              background: "#0d47a1",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {sending ? "Sending..." : "Send Alert"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
