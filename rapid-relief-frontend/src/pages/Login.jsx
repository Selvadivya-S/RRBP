import React, { useState } from "react";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "Donor",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate("/register"); // ✅ auto redirect
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* LEFT HERO */}
      <div className="hero-section">
        <h2>Every Drop Saves a Life</h2>
        <p>
          Rapid Relief connects donors and receivers instantly during emergencies.
        </p>

        <div className="stats">
          <div>
            <h3>10K+</h3>
            <span>Donors</span>
          </div>
          <div>
            <h3>3K+</h3>
            <span>Lives Saved</span>
          </div>
          <div>
            <h3>24×7</h3>
            <span>Support</span>
          </div>
        </div>
      </div>

      {/* LOGIN CARD */}
      <div className="login-card">
        <div className="heartbeat"></div>

        <h1>Rapid Relief Blood Platform</h1>
        <p className="subtitle">Saving lives starts with you</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
            />
            <label>Email</label>
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={form.password}
              onChange={handleChange}
            />
            <label>Password</label>
            <span className="toggle" onClick={() => setShowPassword(!showPassword)}>
              👁
            </span>
          </div>

          <div className="role-group">
            <label>Login as</label>
            <select name="role" onChange={handleChange}>
              <option>Donor</option>
              <option>Receiver</option>
              <option>Admin</option>
            </select>
          </div>

          <div className="options">
            <label>
              <input
                type="checkbox"
                name="remember"
                onChange={handleChange}
              />{" "}
              Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <p className="register-text">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
        <a href="/admin/login" className="admin-login-link">
  Hospital Admin Login
</a>

      </div>
    </div>
  );
};

export default Login;
     