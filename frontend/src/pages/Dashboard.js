import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (user?.role === 'mentor') {
      fetchRequests();
    } else if (user?.role === 'student') {
      fetchStudentRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/mentors/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentRequests = async () => {
    try {
      const res = await axios.get('/mentors/student-requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateRequest = async (requestId, status) => {
    try {
      await axios.put('/mentors/request/update', { requestId, status });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.welcome}>
        <h1 style={styles.title}>Welcome, {user?.name}! 👋</h1>
        <p style={styles.subtitle}>You are logged in as a <strong>{user?.role}</strong></p>
      </div>

      {user?.role === 'mentor' && (
        <div style={styles.requestsSection}>
          <h2 style={styles.sectionTitle}>📬 Mentorship Requests</h2>
          {requests.length === 0 ? (
            <p style={styles.empty}>No requests yet.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} style={styles.requestCard}>
                <div>
                  <p style={styles.requestName}>{req.name}</p>
                  <p style={styles.requestEmail}>{req.email}</p>
                </div>
                <div style={styles.requestActions}>
                  {req.status === 'pending' ? (
                    <>
                      <button
                        style={styles.acceptButton}
                        onClick={() => updateRequest(req.id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        style={styles.rejectButton}
                        onClick={() => updateRequest(req.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: req.status === 'accepted' ? '#27ae60' : '#e74c3c'
                    }}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {user?.role === 'student' && (
        <div style={styles.requestsSection}>
          <h2 style={styles.sectionTitle}>📋 My Mentorship Requests</h2>
          {requests.length === 0 ? (
            <p style={styles.empty}>You haven't sent any requests yet.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} style={styles.requestCard}>
                <div>
                  <p style={styles.requestName}>{req.name}</p>
                  <p style={styles.requestEmail}>{req.email}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: req.status === 'accepted' ? '#27ae60' : req.status === 'rejected' ? '#e74c3c' : '#f39c12'
                }}>
                  {req.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      <div style={styles.grid}>
        <Link to="/mentors" style={styles.card}>
          <div style={styles.icon}>🤝</div>
          <h3>Mentors</h3>
          <p>Find and connect with mentors in your field</p>
        </Link>
        <Link to="/jobs" style={styles.card}>
          <div style={styles.icon}>💼</div>
          <h3>Jobs & Internships</h3>
          <p>Browse the latest opportunities</p>
        </Link>
        <Link to="/resources" style={styles.card}>
          <div style={styles.icon}>📚</div>
          <h3>Resources</h3>
          <p>Access career guides and learning materials</p>
        </Link>
        <Link to="/messages" style={styles.card}>
          <div style={styles.icon}>💬</div>
          <h3>Messages</h3>
          <p>Chat with mentors and professionals</p>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px', maxWidth: '1000px', margin: '0 auto' },
  welcome: { marginBottom: '30px' },
  title: { color: '#2c3e50', fontSize: '28px' },
  subtitle: { color: '#7f8c8d', fontSize: '16px' },
  requestsSection: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginBottom: '30px',
  },
  sectionTitle: { color: '#2c3e50', marginBottom: '20px' },
  empty: { color: '#7f8c8d', fontSize: '14px' },
  requestCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    marginBottom: '10px',
  },
  requestName: { margin: 0, fontWeight: 'bold', color: '#2c3e50' },
  requestEmail: { margin: 0, fontSize: '13px', color: '#7f8c8d' },
  requestActions: { display: 'flex', gap: '10px' },
  acceptButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  statusBadge: {
    color: 'white',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    color: '#2c3e50',
  },
  icon: { fontSize: '40px', marginBottom: '15px' },
};

export default Dashboard;