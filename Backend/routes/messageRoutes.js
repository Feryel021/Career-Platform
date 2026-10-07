const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadCount,
  getUnreadUsers
} = require('../controllers/messageController');

router.post(
  '/',
  verifyToken,
  [
    body('receiverId').isInt({ min: 1 }).withMessage('A valid receiver is required.'),
    body('content')
      .isString().withMessage('Message must be text.')
      .trim()
      .isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters.'),
  ],
  validate,
  sendMessage
);

router.get('/unread-count', verifyToken, getUnreadCount);
router.get('/unread-users', verifyToken, getUnreadUsers);
router.get('/conversations', verifyToken, getConversations);

router.get(
  '/:otherUserId',
  verifyToken,
  [param('otherUserId').isInt({ min: 1 }).withMessage('Invalid user.')],
  validate,
  getMessages
);

module.exports = router;
