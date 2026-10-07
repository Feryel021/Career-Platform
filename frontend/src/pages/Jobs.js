import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { user } = useAuth();
  const canPost = !!user;
  const isStudent = user && user.role === 'student';

  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', description: '', type: 'full-time', apply_link: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/jobs');
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/jobs', { ...formData, type: isStudent ? 'internship' : formData.type });
      setMessage('Job posted successfully!');
      setShowForm(false);
      fetchJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error posting job.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (job) => {
    const text = `🏢 ${job.title} at ${job.company}\n📍 ${job.location}\n🔗 ${job.apply_link || 'No link provided'}`;
    navigator.clipboard.writeText(text);
    setMessage('Job details copied to clipboard!');
  };

  const typeColor = (type) => {
    if (type === 'internship') return '#27ae60';
    if (type === 'part-time') return '#e67e22';
    return '#2980b9';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Jobs & Internships</h2>
          <p style={styles.subtitle}>Browse the latest opportunities</p>
        </div>
        {canPost && (
          <button style={styles.postButton} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Post a Job'}
          </button>
        )}
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {canPost && showForm && (
        <div style={styles.form}>
          <h3>Post a New Job</h3>
          <form onSubmit={handleSubmit}>
            <input style={styles.input} name="title" placeholder="Job Title" onChange={handleChange} required />
            <input style={styles.input} name="company" placeholder="Company Name" onChange={handleChange} required />
            <input style={styles.input} name="location" placeholder="Location" onChange={handleChange} />
            <textarea style={styles.input} name="description" placeholder="Job Description" onChange={handleChange} />
            <input style={styles.input} name="apply_link" placeholder="Application Link (e.g. https://company.com/apply)" onChange={handleChange} />
            <select style={styles.input} name="type" onChange={handleChange}>
              {!isStudent && <option value="full-time">Full-time</option>}
              {!isStudent && <option value="part-time">Part-time</option>}
              <option value="internship">Internship</option>
            </select>
            <button style={styles.submitButton} type="submit">Post Job</button>
          </form>
        </div>
      )}

      {jobs.length === 0 ? (
        <p style={styles.empty}>No jobs posted yet.</p>
      ) : (
        <div style={styles.list}>
          {jobs.map((job) => (
            <div key={job.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <p style={styles.company}>🏢 {job.company} — 📍 {job.location}</p>
                  <p style={styles.postedBy}>👤 Posted by {job.posted_by_name}</p>
                </div>
                <span style={{...styles.badge, backgroundColor: typeColor(job.type)}}>
                  {job.type}
                </span>
              </div>
              <p style={styles.description}>{job.description}</p>
              <div style={styles.cardActions}>
                {job.apply_link && (
                  <a href={job.apply_link} target="_blank" rel="noreferrer" style={styles.applyButton}>
                    Apply Now →
                  </a>
                )}
                <button style={styles.shareButton} onClick={() => handleShare(job)}>
                  📋 Share
                </button>
                {user && job.posted_by === user.id && (
                  <button style={styles.deleteButton} onClick={() => handleDelete(job.id)}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '40px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { color: '#2c3e50', fontSize: '26px', marginBottom: '5px' },
  subtitle: { color: '#7f8c8d' },
  postButton: { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  message: { color: 'green', marginBottom: '20px' },
  form: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '30px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
  submitButton: { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
  empty: { color: '#7f8c8d', textAlign: 'center', marginTop: '50px' },
  list: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  jobTitle: { color: '#2c3e50', marginBottom: '5px' },
  company: { color: '#7f8c8d', fontSize: '14px', marginBottom: '3px' },
  postedBy: { color: '#95a5a6', fontSize: '13px' },
  badge: { color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  description: { color: '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' },
  cardActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  applyButton: { backgroundColor: '#27ae60', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' },
  shareButton: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  deleteButton: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
};

export default Jobs;