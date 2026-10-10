const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

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
router.get('/', verifyToken, getAllMentors);

// Student sends a mentor request
router.post(
  '/request',
  verifyToken,
  requireRole('student'),
  [body('mentorId').isInt({ min: 1 }).withMessage('A valid mentor is required.')],
  validate,
  sendRequest
);

// Mentor gets received requests
router.get('/requests', verifyToken, requireRole('mentor'), getRequests);

// Student gets requests they have sent
router.get('/student-requests', verifyToken, requireRole('student'), getStudentRequests);

// Mentor accepts/rejects a request
router.put(
  '/request/update',
  verifyToken,
  requireRole('mentor'),
  [
    body('requestId').isInt({ min: 1 }).withMessage('A valid request is required.'),
    body('status').isIn(['accepted', 'rejected']).withMessage('Invalid request status.'),
  ],
  validate,
  updateRequest
);

// Get all users except the logged-in user
router.get('/all-users', verifyToken, getAllUsers);

module.exports = router;
