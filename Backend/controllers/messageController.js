const pool = require('../config/db');

exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;
  try {
    if (Number(receiverId) === senderId) {
      return res.status(400).json({ message: 'You cannot send a message to yourself.' });
    }

    const [receivers] = await pool.query('SELECT id FROM users WHERE id = ?', [receiverId]);
    if (receivers.length === 0) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content.trim()]
    );
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getMessages = async (req, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;
  try {
    const [messages] = await pool.query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, otherUserId, otherUserId, userId]
    );
    await pool.query(
      'UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0',
      [userId, otherUserId]
    );
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const [conversations] = await pool.query(
      `SELECT u.id, u.name, u.role, MAX(m.created_at) AS last_message_at
       FROM messages m
       JOIN users u ON u.id = IF(m.sender_id = ?, m.receiver_id, m.sender_id)
       WHERE m.sender_id = ? OR m.receiver_id = ?
       GROUP BY u.id, u.name, u.role
       ORDER BY last_message_at DESC`,
      [userId, userId, userId]
    );
    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUnreadCount = async (req, res) => {
  const userId = req.user.id;
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [userId]
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUnreadUsers = async (req, res) => {
  const userId = req.user.id;
  try {
    const [result] = await pool.query(
      'SELECT DISTINCT sender_id FROM messages WHERE receiver_id = ? AND is_read = 0',
      [userId]
    );
    res.json(result);
  } catch (error) {
    console.error('Error getting unread users:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
