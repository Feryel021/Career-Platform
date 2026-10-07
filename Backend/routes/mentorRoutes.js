const express = require('express');

const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const {
  getAllMentors,
  sendRequest,
  getRequests,
  getStudentRequests,
  updateRequest
} = require('../controllers/mentorController');

const {
  getAllUsers
} = require('../controllers/authController');


// Get all mentors
router.get(
  '/',
  verifyToken,
  getAllMentors
);


// Student sends a mentor request
router.post(
  '/request',
  verifyToken,
  requireRole('student'),
  sendRequest
);


// Mentor gets received requests
router.get(
  '/requests',
  verifyToken,
  requireRole('mentor'),
  getRequests
);


// Student gets requests they have sent
router.get(
  '/student-requests',
  verifyToken,
  requireRole('student'),
  getStudentRequests
);


// Mentor accepts/rejects a request
router.put(
  '/request/update',
  verifyToken,
  requireRole('mentor'),
  updateRequest
);


// Get all users except the logged-in user
router.get(
  '/all-users',
  verifyToken,
  getAllUsers
);


module.exports = router;