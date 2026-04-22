import React, { useState } from 'react';
import '../styles/LoginForm.css';
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";


const LoginForm = ({ onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill all fields');
    setError('');
    alert('Login Successful! (mock)');
  };

  const handleSocialLogin = (provider) => {
    alert(`Logging in with ${provider} (mock)`);
  };

  return (
    <div className="login-card">
      <h2>Rapid Relief Blood Platform</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>

      {/* Social Login Buttons */}
      <div className="social-login">
        <button className="google-btn" onClick={() => handleSocialLogin('Google')}>Login with Google</button>
        <button className="facebook-btn" onClick={() => handleSocialLogin('Facebook')}>Login with Facebook</button>
      </div>

      <p>
        Don't have an account? <span className="register-link" onClick={onNavigateRegister}>Register here</span>
      </p>
    </div>
  );
};

export default LoginForm;
