const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const validate = require('../middleware/validate');
const { register, login } = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
    body('email').trim().isEmail().withMessage('Please enter a valid email.')
      .isLength({ max: 100 }).withMessage('Email is too long.'),
    body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters.'),
    body('role').isIn(['student', 'mentor', 'professional']).withMessage('Invalid role.'),
    body('field').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('Field is too long.'),
    body('experience').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('Experience is too long.'),
    body('bio').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }).withMessage('Bio is too long (max 1000).'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

module.exports = router;
