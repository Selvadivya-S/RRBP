import React, { useState } from "react";
import axios from "axios";

const Emergency = ({ user }) => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/admin/emergency", {
        email: user.email,
        message,
      });
      setStatus(res.data.message);
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to send emergency");
    }
  };

  return (
    <div>
      <h3>Send Emergency to {user.name}</h3>
      <textarea placeholder="Enter emergency message" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSend}>Send</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default Emergency;
