const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { getAllJobs, createJob, deleteJob } = require('../controllers/jobController');

router.get('/', getAllJobs);

router.post(
  '/',
  verifyToken,
  [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 characters).'),
    body('company').trim().isLength({ min: 1, max: 100 }).withMessage('Company is required (max 100 characters).'),
    body('location').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('Location is too long.'),
    body('description').optional({ values: 'falsy' }).trim().isLength({ max: 5000 }).withMessage('Description is too long.'),
    body('type').isIn(['full-time', 'part-time', 'internship']).withMessage('Invalid job type.'),
    body('apply_link').optional({ values: 'falsy' }).trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Application link must start with http:// or https://')
      .isLength({ max: 255 }).withMessage('Application link is too long.'),
  ],
  validate,
  createJob
);

router.delete(
  '/:id',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Invalid job id.')],
  validate,
  deleteJob
);

module.exports = router;
