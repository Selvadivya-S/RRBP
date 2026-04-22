import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HospitalDashboard() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/get_users');
        setUsers(res.data.users);
      } catch (err) {
        alert('Error fetching users');
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (email) => {
    setSelected(selected.includes(email) ? selected.filter(e => e !== email) : [...selected, email]);
  };

  const sendMessage = async () => {
    if (!message || selected.length === 0) return;
    try {
      for (let email of selected) {
        await axios.post('http://127.0.0.1:5000/send_emergency', { email, msg: message });
      }
      alert('Emergency message sent!');
      setSelected([]);
      setMessage('');
    } catch (err) {
      alert('Error sending message');
    }
  };

  return (
    <div>
      <h2>Hospital Dashboard</h2>
      
      <input
        type="text"
        placeholder="Search patients by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '300px', marginBottom: '10px' }}
      />

      <br />
      <textarea
        value={message}
        placeholder="Emergency message"
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: '400px', height: '100px' }}
      /><br/>
      <button onClick={sendMessage} disabled={selected.length === 0 || !message}>
        Send to Selected Patients
      </button>

      <h3>Registered Patients</h3>
      <ul>
        {filteredUsers.map(user => (
          <li key={user.email}>
            <input
              type="checkbox"
              checked={selected.includes(user.email)}
              onChange={() => toggleSelect(user.email)}
            />
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HospitalDashboard;
