import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Resources = () => {
  const { user } = useAuth();
  const canPost = !!user;

  const [resources, setResources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', link: '', category: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await axios.get('/resources');
      setResources(Array.isArray(res.data) ? res.data : []);
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
      await axios.post('/resources', formData);
      setMessage('Resource added successfully!');
      setShowForm(false);
      fetchResources();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error adding resource.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (resource) => {
    const text = `📚 ${resource.title}\n${resource.description}\n🔗 ${resource.link || 'No link provided'}`;
    navigator.clipboard.writeText(text);
    setMessage('Resource details copied to clipboard!');
  };

  const categoryColor = (category) => {
    const colors = {
      'CV Writing': '#8e44ad',
      'Interview Tips': '#2980b9',
      'Career Advice': '#27ae60',
      'Technical Skills': '#e67e22',
    };
    return colors[category] || '#2c3e50';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Career Resources</h2>
          <p style={styles.subtitle}>Explore guides, articles and learning materials</p>
        </div>
        {canPost && (
          <button style={styles.postButton} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Resource'}
          </button>
        )}
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {canPost && showForm && (
        <div style={styles.form}>
          <h3>Share a Resource</h3>
          <form onSubmit={handleSubmit}>
            <input style={styles.input} name="title" placeholder="Resource Title" onChange={handleChange} required />
            <textarea style={styles.input} name="description" placeholder="Description" onChange={handleChange} />
            <input style={styles.input} name="link" placeholder="Link (e.g. https://...)" onChange={handleChange} />
            <select style={styles.input} name="category" onChange={handleChange}>
              <option value="">Select Category</option>
              <option value="CV Writing">CV Writing</option>
              <option value="Interview Tips">Interview Tips</option>
              <option value="Career Advice">Career Advice</option>
              <option value="Technical Skills">Technical Skills</option>
            </select>
            <button style={styles.submitButton} type="submit">Add Resource</button>
          </form>
        </div>
      )}

      {resources.length === 0 ? (
        <p style={styles.empty}>No resources added yet.</p>
      ) : (
        <div style={styles.grid}>
          {resources.map((resource) => (
            <div key={resource.id} style={styles.card}>
              <span style={{...styles.badge, backgroundColor: categoryColor(resource.category)}}>
                {resource.category || 'General'}
              </span>
              <h3 style={styles.resourceTitle}>{resource.title}</h3>
              <p style={styles.description}>{resource.description}</p>
              <p style={styles.sharedBy}>👤 Shared by {resource.posted_by_name}</p>
              <div style={styles.cardActions}>
                {resource.link && (
                  <a href={resource.link} target="_blank" rel="noreferrer" style={styles.visitButton}>
                    Visit Resource →
                  </a>
                )}
                <button style={styles.shareButton} onClick={() => handleShare(resource)}>
                  📋 Share
                </button>
                {user && resource.posted_by === user.id && (
                  <button style={styles.deleteButton} onClick={() => handleDelete(resource.id)}>
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
  container: { padding: '40px', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { color: '#2c3e50', fontSize: '26px', marginBottom: '5px' },
  subtitle: { color: '#7f8c8d' },
  postButton: { backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  message: { color: 'green', marginBottom: '20px' },
  form: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '30px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
  submitButton: { backgroundColor: '#8e44ad', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
  empty: { color: '#7f8c8d', textAlign: 'center', marginTop: '50px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  badge: { color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '12px' },
  resourceTitle: { color: '#2c3e50', marginBottom: '8px' },
  description: { color: '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' },
  sharedBy: { color: '#95a5a6', fontSize: '13px', marginBottom: '15px' },
  cardActions: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  visitButton: { backgroundColor: '#2980b9', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' },
  shareButton: { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  deleteButton: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
};

export default Resources;