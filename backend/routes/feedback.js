const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', [
  auth,
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('subject').notEmpty().withMessage('Subject is required').isLength({ max: 200 }).withMessage('Subject must be less than 200 characters'),
    body('message').notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message must be less than 2000 characters'),
    body('category').isIn(['bug', 'feature', 'general', 'complaint', 'praise']).withMessage('Invalid category'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, subject, message, category, rating, isAnonymous } = req.body;

    const feedback = new Feedback({
      userId: req.user.id,
      email,
      subject,
      message,
      category,
      rating,
      isAnonymous: isAnonymous || false
    });

    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback
// @desc    Get user's feedback history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/feedback/:id
// @desc    Get specific feedback by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).select('-__v');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/feedback/:id
// @desc    Update feedback
// @access  Private
router.put('/:id', [
  auth,
  [
    body('subject').optional().notEmpty().withMessage('Subject cannot be empty').isLength({ max: 200 }).withMessage('Subject must be less than 200 characters'),
    body('message').optional().notEmpty().withMessage('Message cannot be empty').isLength({ max: 2000 }).withMessage('Message must be less than 2000 characters'),
    body('category').optional().isIn(['bug', 'feature', 'general', 'complaint', 'praise']).withMessage('Invalid category'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const feedback = await Feedback.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Only allow updates if status is still pending
    if (feedback.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update feedback that has been processed' });
    }

    const { subject, message, category, rating } = req.body;

    if (subject) feedback.subject = subject;
    if (message) feedback.message = message;
    if (category) feedback.category = category;
    if (rating) feedback.rating = rating;

    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Only allow deletion if status is still pending
    if (feedback.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete feedback that has been processed' });
    }

    await feedback.remove();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes (for future admin panel)
// @route   GET /api/feedback/admin/all
// @desc    Get all feedback (admin only)
// @access  Private (Admin)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // TODO: Add admin role check
    const { page = 1, limit = 10, status, category, priority } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const feedback = await Feedback.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Feedback.countDocuments(filter);

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Admin get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 