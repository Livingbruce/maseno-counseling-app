import React, { useState, useEffect } from 'react'
import { useAuth } from '../utils/AuthContext'
import './Dashboard.css'

function Dashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    appointments: 0,
    students: 0,
    counselors: 0,
    announcements: 0
  })

  useEffect(() => {
    // Simulate loading stats
    setStats({
      appointments: 25,
      students: 150,
      counselors: 8,
      announcements: 12
    })
  }, [])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎓 Maseno Counseling Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.appointments}</h3>
              <p>Appointments</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.students}</h3>
              <p>Students</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-content">
              <h3>{stats.counselors}</h3>
              <p>Counselors</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📢</div>
            <div className="stat-content">
              <h3>{stats.announcements}</h3>
              <p>Announcements</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-time">2 hours ago</span>
                <span className="activity-text">New appointment scheduled</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">4 hours ago</span>
                <span className="activity-text">Student registration completed</span>
              </div>
              <div className="activity-item">
                <span className="activity-time">1 day ago</span>
                <span className="activity-text">New announcement published</span>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button className="action-button">
                📅 Schedule Appointment
              </button>
              <button className="action-button">
                📢 Create Announcement
              </button>
              <button className="action-button">
                👥 Manage Students
              </button>
              <button className="action-button">
                📊 View Reports
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
