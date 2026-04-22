const handleRegister = async (e) => {
  e.preventDefault();
  setError("");

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  for (let key in formData) {
    if (!formData[key]) {
      setError("Please fill all fields.");
      return;
    }
  }

  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();

    if (response.ok) {
      alert("Registration Successful! Redirecting to Login page...");
      navigate("/login");
    } else {
      setError(data.message || "Registration failed");
    }
  } catch (err) {
    setError("Server error. Try again later.");
  }
};
