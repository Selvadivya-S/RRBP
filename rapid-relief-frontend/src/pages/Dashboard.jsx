import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const summary = [
    { title: "Total Members", value: 520 },
    { title: "Active Donors", value: 380 },
    { title: "Total Blood Collected (L)", value: 184 },
    { title: "Blood Used (L)", value: 146.5 },
    { title: "Available Stock (L)", value: 37.5 },
  ];

  const bloodData = [
    { group: "A+", collected: 37.5, used: 30, remaining: 7.5 },
    { group: "A-", collected: 10, used: 7.5, remaining: 2.5 },
    { group: "B+", collected: 41, used: 35, remaining: 6 },
    { group: "B-", collected: 9, used: 5, remaining: 4 },
    { group: "O+", collected: 47.5, used: 40, remaining: 7.5 },
    { group: "O-", collected: 12.5, used: 9, remaining: 3.5 },
    { group: "AB+", collected: 20, used: 15, remaining: 5 },
    { group: "AB-", collected: 7.5, used: 5, remaining: 2.5 },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        🩸 Rapid Relief Blood Platform Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="summary-grid">
        {summary.map((item, index) => (
          <div
            key={index}
            className={`summary-card ${
              item.title === "Available Stock (L)" ? "highlight" : ""
            }`}
          >
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Blood Table */}
      <div className="table-section">
        <h2>Blood Stock Details</h2>
        <table>
          <thead>
            <tr>
              <th>Blood Group</th>
              <th>Collected (L)</th>
              <th>Used (L)</th>
              <th>Remaining (L)</th>
            </tr>
          </thead>
          <tbody>
            {bloodData.map((item, index) => (
              <tr key={index}>
                <td>{item.group}</td>
                <td>{item.collected}</td>
                <td>{item.used}</td>
                <td>{item.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;