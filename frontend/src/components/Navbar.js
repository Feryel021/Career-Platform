import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/messages/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>CareerPortal</div>
      {user ? (
        <div style={styles.links}>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/mentors" style={styles.link}>Mentors</Link>
          <Link to="/jobs" style={styles.link}>Jobs</Link>
          <Link to="/resources" style={styles.link}>Resources</Link>
          <Link to="/messages" style={styles.link} onClick={() => setUnreadCount(0)}>
            Messages
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </Link>
          <span style={styles.roleBadge}>{user.role}</span>
          <span style={styles.userName}>👤 {user.name}</span>
          <button onClick={handleLogout} style={styles.button}>Logout</button>
        </div>
      ) : (
        <div style={styles.links}>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/register" style={styles.link}>Register</Link>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#2c3e50',
    color: 'white',
  },
  brand: { fontSize: '22px', fontWeight: 'bold', color: 'white' },
  links: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { color: '#1abc9c', textDecoration: 'underline', fontSize: '15px', position: 'relative' },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  roleBadge: {
    backgroundColor: '#1abc9c',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  userName: { color: 'white', fontSize: '14px' },
  button: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Navbar;
