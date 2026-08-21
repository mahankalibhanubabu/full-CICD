import React from 'react';

const mockData = [
  { name: 'Build #123', status: 'Success', duration: '5m' },
  { name: 'Deploy #456', status: 'Running', duration: '2m' },
  { name: 'Test #789', status: 'Failed', duration: '1m' },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Pipeline Overview</h2>
      <div className="cards">
        {mockData.map((item) => (
          <div key={item.name} className={`card glass ${item.status.toLowerCase()}`}>
            <h3>{item.name}</h3>
            <p>Status: {item.status}</p>
            <p>Duration: {item.duration}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
