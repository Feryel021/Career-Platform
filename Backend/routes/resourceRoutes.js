const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { getAllResources, createResource, deleteResource } = require('../controllers/resourceController');

router.get('/', getAllResources);

router.post(
  '/',
  verifyToken,
  [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 characters).'),
    body('description').optional({ values: 'falsy' }).trim().isLength({ max: 5000 }).withMessage('Description is too long.'),
    body('link').optional({ values: 'falsy' }).trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Link must start with http:// or https://')
      .isLength({ max: 255 }).withMessage('Link is too long.'),
    body('category').optional({ values: 'falsy' })
      .isIn(['CV Writing', 'Interview Tips', 'Career Advice', 'Technical Skills']).withMessage('Invalid category.'),
  ],
  validate,
  createResource
);

router.delete(
  '/:id',
  verifyToken,
  [param('id').isInt({ min: 1 }).withMessage('Invalid resource id.')],
  validate,
  deleteResource
);

module.exports = router;
