import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    city: "",
    aadhaar: "",
    password: "",
    role: "Donor",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const passwordStrength = () => {
    const { password } = form;
    if (!password) return "";
    if (password.length < 6) return "weak";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password))
      return "strong";
    return "medium";
  };

  const validateForm = () => {
    const { name, email, password, bloodGroup, city, aadhaar } = form;

    if (!name || !email || !password || !bloodGroup || !city || !aadhaar)
      return "Please fill in all required fields.";

    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailRegex.test(email)) return "Invalid email address.";

    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaar))
      return "Aadhaar number must be exactly 12 digits.";

    if (password.length < 6)
      return "Password must be at least 6 characters.";

    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    const validationError = validateForm();
    if (validationError) {
      setFeedback({ type: "error", message: `❌ ${validationError}` });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/register",
        form
      );

      if (response.data.success) {
        // ✅ Check if backend message includes "Check your email"
        const isEmailSent = response.data.message.toLowerCase().includes("check your email");

        setFeedback({
          type: "success",
          message: isEmailSent
            ? `✅ Registration successful! Confirmation email sent to ${form.email}`
            : `⚠️ Registration successful, but email could not be sent. Please check email configuration.`,
        });

        // Reset form only if registration + email succeeded
        if (isEmailSent) {
          setForm({
            name: "",
            email: "",
            phone: "",
            age: "",
            gender: "",
            bloodGroup: "",
            city: "",
            aadhaar: "",
            password: "",
            role: "Donor",
          });
        }
      } else {
        setFeedback({ type: "error", message: `❌ ${response.data.message}` });
      }
    } catch (err) {
      console.error("Register error:", err);
      setFeedback({
        type: "error",
        message: `❌ ${err.response?.data?.message || "Failed to register. Please try again."}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <div className="overlay"></div>
      <div className="register-card">
        <h1>Rapid Relief</h1>
        <p className="subtitle">Join Us to Save Lives</p>

        {feedback.message && (
          <div
            className={`feedback-msg ${feedback.type}`}
            style={{ color: feedback.type === "success" ? "green" : "red" }}
          >
            {feedback.message}
          </div>
        )}

        {feedback.type !== "success" && (
          <form onSubmit={handleRegister}>
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              value={form.name}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              value={form.email}
            />

            <input
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              value={form.phone}
            />

            <input
              name="age"
              type="number"
              placeholder="Age"
              onChange={handleChange}
              value={form.age}
            />

            <select
              name="gender"
              onChange={handleChange}
              value={form.gender}
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <select
              name="bloodGroup"
              onChange={handleChange}
              value={form.bloodGroup}
            >
              <option value="">Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>

            <input
              name="city"
              placeholder="City"
              onChange={handleChange}
              value={form.city}
            />

            <input
              name="aadhaar"
              placeholder="Aadhaar Number"
              maxLength="12"
              onChange={handleChange}
              value={form.aadhaar}
            />

            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                onChange={handleChange}
                value={form.password}
              />
              <span
                className="eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </span>
            </div>

            {form.password && (
              <div className={`strength ${passwordStrength()}`}>
                Password strength: {passwordStrength()}
              </div>
            )}

            <div className="checkbox">
              <input type="checkbox" required />
              <label>I accept Terms & Conditions</label>
            </div>

            <div className="actions">
              <button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        )}

        {feedback.type === "success" && (
          <div className="success-actions">
            <button onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        )}

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
