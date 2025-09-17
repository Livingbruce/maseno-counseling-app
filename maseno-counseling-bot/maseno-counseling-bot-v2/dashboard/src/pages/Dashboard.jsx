import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalStudents: 0,
    totalAnnouncements: 0,
    totalActivities: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('counselor');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🎓 Maseno Counseling Dashboard v2</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Appointments</h3>
              <p className="stat-number">{stats.totalAppointments}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Students</h3>
              <p className="stat-number">{stats.totalStudents}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📢</div>
            <div className="stat-content">
              <h3>Announcements</h3>
              <p className="stat-number">{stats.totalAnnouncements}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Activities</h3>
              <p className="stat-number">{stats.totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="welcome-section">
          <h2>Welcome to Maseno Counseling Dashboard v2!</h2>
          <p>This is a clean, new version of the counseling management system.</p>
          <div className="features">
            <div className="feature">
              <h4>✅ Clean Architecture</h4>
              <p>Modular, maintainable code structure</p>
            </div>
            <div className="feature">
              <h4>🔒 Enhanced Security</h4>
              <p>Rate limiting, input validation, and secure authentication</p>
            </div>
            <div className="feature">
              <h4>📱 Responsive Design</h4>
              <p>Works perfectly on all devices</p>
            </div>
            <div className="feature">
              <h4>🚀 Fast Performance</h4>
              <p>Optimized for speed and efficiency</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
