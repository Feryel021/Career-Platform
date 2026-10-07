import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    field: '',
    experience: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join the Career Portal</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
          <input style={styles.input} type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input style={styles.input} type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <select style={styles.input} name="role" onChange={handleChange}>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="professional">Professional</option>
          </select>
          <input style={styles.input} type="text" name="field" placeholder="Field (e.g. Computer Science)" onChange={handleChange} />
          <input style={styles.input} type="text" name="experience" placeholder="Experience (e.g. 3 years)" onChange={handleChange} />
          <textarea style={styles.input} name="bio" placeholder="Short bio about yourself" onChange={handleChange} />
          <button style={styles.button} type="submit">Register</button>
        </form>
        <p style={styles.bottom}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '30px 0',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    margin: '0 0 5px 0',
    color: '#2c3e50',
  },
  subtitle: {
    color: '#7f8c8d',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '15px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  bottom: {
    textAlign: 'center',
    marginTop: '15px',
    color: '#7f8c8d',
  },
};

export default Register;
