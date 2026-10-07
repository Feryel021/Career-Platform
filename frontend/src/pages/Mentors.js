import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await axios.get('/mentors');
      setMentors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (mentorId) => {
    try {
      await axios.post('/mentors/request', { mentorId });
      setMessage('Mentor request sent successfully!');
      setSelectedMentor(null);
    } catch (err) {
      setMessage('Request already sent or error occurred.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Find a Mentor</h2>
      <p style={styles.subtitle}>Connect with experienced professionals in your field</p>
      {message && <p style={styles.message}>{message}</p>}

      {selectedMentor && (
        <div style={styles.overlay} onClick={() => setSelectedMentor(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalAvatar}>{selectedMentor.name.charAt(0)}</div>
            <h2 style={styles.modalName}>{selectedMentor.name}</h2>
            <p style={styles.modalEmail}>📧 {selectedMentor.email}</p>
            <p style={styles.modalField}>📌 {selectedMentor.field || 'Not specified'}</p>
            <p style={styles.modalExperience}>⏳ {selectedMentor.experience || 'Not specified'}</p>
            <p style={styles.modalBio}>{selectedMentor.bio || 'No bio available.'}</p>
            <div style={styles.modalButtons}>
              <button style={styles.connectButton} onClick={() => sendRequest(selectedMentor.id)}>Connect</button>
              <button style={styles.closeButton} onClick={() => setSelectedMentor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {mentors.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyTitle}>No mentors available yet.</p>
          <p style={styles.emptyHint}>Are you an experienced professional? <a href="/register">Register as a mentor</a> to be listed here!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {mentors.map((mentor) => (
            <div key={mentor.id} style={styles.card}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
              }}
            >
              <div style={styles.avatar}>{mentor.name.charAt(0)}</div>
              <h3 style={styles.name}>{mentor.name}</h3>
              <p style={styles.field}>📌 {mentor.field || 'Not specified'}</p>
              <p style={styles.experience}>⏳ {mentor.experience || 'Not specified'}</p>
              <p style={styles.bio}>{mentor.bio || 'No bio available.'}</p>
              <div style={styles.cardButtons}>
                <button style={styles.viewButton} onClick={() => setSelectedMentor(mentor)}>View Profile</button>
                <button style={styles.button} onClick={() => sendRequest(mentor.id)}>Connect</button>
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
  title: { color: '#2c3e50', fontSize: '26px', marginBottom: '5px' },
  subtitle: { color: '#7f8c8d', marginBottom: '30px' },
  message: { color: 'green', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: {
    backgroundColor: 'white', padding: '25px', borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)', textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  avatar: {
    width: '60px', height: '60px', borderRadius: '50%',
    backgroundColor: '#2c3e50', color: 'white', fontSize: '24px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 15px auto',
  },
  name: { color: '#2c3e50', marginBottom: '8px' },
  field: { color: '#7f8c8d', fontSize: '14px', marginBottom: '5px' },
  experience: { color: '#7f8c8d', fontSize: '14px', marginBottom: '10px' },
  bio: { color: '#555', fontSize: '13px', marginBottom: '15px' },
  cardButtons: { display: 'flex', gap: '10px', justifyContent: 'center' },
  viewButton: {
    backgroundColor: 'white', color: '#2c3e50',
    border: '2px solid #2c3e50', padding: '8px 16px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
  },
  button: {
    backgroundColor: '#2c3e50', color: 'white',
    border: 'none', padding: '8px 16px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white', padding: '40px', borderRadius: '15px',
    maxWidth: '450px', width: '90%', textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  modalAvatar: {
    width: '80px', height: '80px', borderRadius: '50%',
    backgroundColor: '#2c3e50', color: 'white', fontSize: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px auto',
  },
  modalName: { color: '#2c3e50', marginBottom: '10px' },
  modalEmail: { color: '#7f8c8d', fontSize: '14px', marginBottom: '8px' },
  modalField: { color: '#7f8c8d', fontSize: '14px', marginBottom: '8px' },
  modalExperience: { color: '#7f8c8d', fontSize: '14px', marginBottom: '15px' },
  modalBio: { color: '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' },
  modalButtons: { display: 'flex', gap: '15px', justifyContent: 'center' },
  connectButton: {
    backgroundColor: '#2c3e50', color: 'white', border: 'none',
    padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px',
  },
  closeButton: {
    backgroundColor: 'white', color: '#2c3e50', border: '2px solid #2c3e50',
    padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px',
  },
  emptyBox: {
    textAlign: 'center', marginTop: '50px', padding: '40px',
    backgroundColor: 'white', borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },
  emptyTitle: { color: '#2c3e50', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' },
  emptyHint: { color: '#7f8c8d', fontSize: '15px' },
};

export default Mentors;