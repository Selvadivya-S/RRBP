const API_URL = "http://localhost:5000/api";

// ------------------ Admin Login ------------------
export async function loginAdmin(email, password) {
  try {
    const res = await fetch("http://localhost:5000/admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch (e) {
    console.error("Login error:", e);
    return { success: false, message: "Server error" };
  }
}

// ------------------ Session Check ------------------
export async function checkSession() {
  try {
    const res = await fetch(`${API_URL}/session`, {
      method: "GET",
      credentials: "include", // send cookies to Flask
    });
    return await res.json();
  } catch (e) {
    console.error("Session JSON parse error:", e);
    return { logged_in: false };
  }
}

// ------------------ Logout ------------------
export async function logoutAdmin() {
  try {
    const res = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error("Logout error:", e);
    return { message: "Logout failed" };
  }
}

// ------------------ Fetch All Users ------------------
export async function fetchUsers() {
  try {
    const res = await fetch("http://localhost:5000/admin/users", {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error("Fetch users error:", e);
    return { users: [] };
  }
}

// ------------------ Send Alerts ------------------
export async function sendAlerts(emails, message) {
  try {
    const res = await fetch("http://localhost:5000/admin/send_alerts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails, message }),
    });
    return await res.json();
  } catch (e) {
    console.error("Send alerts error:", e);
    return { status: "error", message: "Failed to send alerts" };
  }
}
