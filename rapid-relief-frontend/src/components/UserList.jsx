import React, { useEffect, useState } from "react";
import axios from "axios";
import Emergency from "./Emergency.jsx";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Registered Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} ({user.email}){" "}
            <button onClick={() => setSelectedUser(user)}>Send Emergency</button>
          </li>
        ))}
      </ul>

      {selectedUser && <Emergency user={selectedUser} />}
    </div>
  );
};

export default UserList;
