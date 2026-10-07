const pool = require('../config/db');


// Get all mentors
exports.getAllMentors = async (req, res) => {
  try {
    const [mentors] = await pool.query(
      `SELECT id, name, email, field, experience, bio
       FROM users
       WHERE role = ? AND id != ?`,
      ['mentor', req.user.id]
    );

    res.json(mentors);
  } catch (error) {
    console.error('Error getting mentors:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Student sends a mentor request
exports.sendRequest = async (req, res) => {
  const { mentorId } = req.body;
  const studentId = req.user.id;

  try {
    // Check that the selected user is actually a mentor
    const [mentors] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = ?',
      [mentorId, 'mentor']
    );

    if (mentors.length === 0) {
      return res.status(404).json({
        message: 'Mentor not found.'
      });
    }

    // Prevent duplicate requests at application level
    const [existing] = await pool.query(
      `SELECT id, status
       FROM mentor_requests
       WHERE student_id = ? AND mentor_id = ?`,
      [studentId, mentorId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Request already sent.'
      });
    }

    await pool.query(
      `INSERT INTO mentor_requests
       (student_id, mentor_id, status)
       VALUES (?, ?, ?)`,
      [studentId, mentorId, 'pending']
    );

    res.status(201).json({
      message: 'Mentor request sent successfully.'
    });
  } catch (error) {
    console.error('Error sending mentor request:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Get requests received by the logged-in mentor
exports.getRequests = async (req, res) => {
  const mentorId = req.user.id;

  try {
    const [requests] = await pool.query(
      `SELECT
         mr.id,
         mr.student_id,
         u.name,
         u.email,
         mr.status
       FROM mentor_requests mr
       JOIN users u ON mr.student_id = u.id
       WHERE mr.mentor_id = ?
       ORDER BY mr.id DESC`,
      [mentorId]
    );

    res.json(requests);
  } catch (error) {
    console.error('Error getting mentor requests:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Get requests sent by the logged-in student
exports.getStudentRequests = async (req, res) => {
  const studentId = req.user.id;

  try {
    const [requests] = await pool.query(
      `SELECT
         mr.id,
         mr.mentor_id,
         u.name AS mentor_name,
         u.email AS mentor_email,
         u.field,
         u.experience,
         mr.status
       FROM mentor_requests mr
       JOIN users u ON mr.mentor_id = u.id
       WHERE mr.student_id = ?
       ORDER BY mr.id DESC`,
      [studentId]
    );

    res.json(requests);
  } catch (error) {
    console.error('Error getting student requests:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


// Mentor accepts or rejects a request
exports.updateRequest = async (req, res) => {
  const { requestId, status } = req.body;
  const mentorId = req.user.id;

  try {
    // Only allow valid request statuses
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid request status.'
      });
    }

    // Only the mentor who received the request can update it
    const [result] = await pool.query(
      `UPDATE mentor_requests
       SET status = ?
       WHERE id = ? AND mentor_id = ?`,
      [status, requestId, mentorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Request not found or access denied.'
      });
    }

    res.json({
      message: 'Request updated successfully.'
    });
  } catch (error) {
    console.error('Error updating mentor request:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};