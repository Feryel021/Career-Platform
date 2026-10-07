const pool = require('../config/db');

exports.getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, u.name as posted_by_name
       FROM jobs j
       JOIN users u ON j.posted_by = u.id
       ORDER BY j.created_at DESC`
    );
    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createJob = async (req, res) => {
  const { title, company, location, description, type, apply_link } = req.body;
  const userId = req.user.id;
  if (req.user.role === 'student' && type !== 'internship') {
    return res.status(403).json({ message: 'Students can only post internships.' });
  }
  try {
    await pool.query(
      'INSERT INTO jobs (title, company, location, description, type, posted_by, apply_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, company, location, description, type, userId, apply_link || null]
    );
    res.status(201).json({ message: 'Job posted successfully.' });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteJob = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const [result] = await pool.query(
      'DELETE FROM jobs WHERE id = ? AND posted_by = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found or you are not allowed to delete it.' });
    }
    res.json({ message: 'Job deleted successfully.' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
