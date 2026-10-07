const pool = require('../config/db');

exports.getAllResources = async (req, res) => {
  try {
    const [resources] = await pool.query(
      `SELECT r.*, u.name as posted_by_name
       FROM resources r
       JOIN users u ON r.posted_by = u.id
       ORDER BY r.created_at DESC`
    );
    res.json(resources);
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createResource = async (req, res) => {
  const { title, description, link, category } = req.body;
  const userId = req.user.id;
  try {
    await pool.query(
      'INSERT INTO resources (title, description, link, category, posted_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, link, category, userId]
    );
    res.status(201).json({ message: 'Resource added successfully.' });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteResource = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const [result] = await pool.query(
      'DELETE FROM resources WHERE id = ? AND posted_by = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Resource not found or you are not allowed to delete it.' });
    }
    res.json({ message: 'Resource deleted successfully.' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
