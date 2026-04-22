import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Single Professional Hospital Background Image
  const backgroundImage =
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80";

  // Floating blood drops
  useEffect(() => {
    const dropsContainer = document.getElementById("drops-container");
    if (!dropsContainer) return;

    const createDrop = () => {
      const drop = document.createElement("div");
      drop.className = "blood-drop";
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${3 + Math.random() * 2}s`;
      dropsContainer.appendChild(drop);
      setTimeout(() => drop.remove(), 5000);
    };

    const interval = setInterval(createDrop, 400);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("adminToken", data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
          zIndex: 0,
        }}
      />

      {/* Blood animation */}
      <div
        id="drops-container"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />

      {/* Login Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "360px",
          padding: "40px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(15px)",
          textAlign: "center",
          color: "#fff",
          boxShadow:
            "0 0 20px rgba(255,0,0,0.5), 0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <h1
          style={{
            marginBottom: "30px",
            fontWeight: "bold",
            textShadow: "0 0 8px #FF0000",
          }}
        >
          🩸 Hospital Admin Login
        </h1>

        {error && (
          <div
            style={{
              background: "#f44336",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              border: "none",
              outline: "none",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "30px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              border: "none",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "#B22222",
              color: "#fff",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Blood animation CSS */}
      <style>{`
        .blood-drop {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #ff0000;
          border-radius: 50%;
          opacity: 0.8;
          animation: drop linear 1;
        }
        @keyframes drop {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;
