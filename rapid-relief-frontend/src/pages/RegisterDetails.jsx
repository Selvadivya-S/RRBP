import React, { useState } from "react";
import axios from "axios";
import "../styles/RegisterDetails.css";

const RegisterDetails = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    bloodGroup: "",
    gender: "",
    role: "",
    address: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/register",
        form
      );
      alert(res.data.message);
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="register-bg">
      <div className="register-card">
        <h2>Rapid Relief Registration</h2>
        <p>Join to save lives</p>

        <form onSubmit={handleSubmit}>
          <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
          <input name="age" type="number" placeholder="Age" onChange={handleChange} required />

          <select name="bloodGroup" onChange={handleChange} required>
            <option value="">Blood Group</option>
            <option>A+</option><option>A-</option>
            <option>B+</option><option>B-</option>
            <option>AB+</option><option>AB-</option>
            <option>O+</option><option>O-</option>
          </select>

          <select name="gender" onChange={handleChange} required>
            <option value="">Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <select name="role" onChange={handleChange} required>
            <option value="">Role</option>
            <option>Donor</option>
            <option>Receiver</option>
          </select>

          <textarea name="address" placeholder="Address" onChange={handleChange} required />

          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDetails;
