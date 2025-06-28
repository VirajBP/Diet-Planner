const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const config = require('../config');
const { validateRegistration } = require('../middleware/validation');

// Register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password, profile } = req.body;
    console.log('Registration attempt for email:', email);

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with profile data
    user = new User({
      email: email.toLowerCase(),
      password,
      isPremium: true,
      premiumTrialStartDate: new Date(),
      premiumTrialUsed: false,
      profile: {
        ...profile,
        name: profile.name.trim(),
        age: parseInt(profile.age),
        height: parseInt(profile.height),
        weight: parseInt(profile.weight),
        targetWeight: parseInt(profile.targetWeight),
        goal: profile.goal || 'maintain',
        activityLevel: profile.activityLevel.toLowerCase(),
        dietaryRestrictions: profile.dietaryRestrictions || [],
        stats: {
          totalCaloriesBurned: 0,
          totalWorkouts: 0,
          streakDays: 0,
          weightLogs: [],
          lastWorkout: null
        }
      }
    });

    // Save user (password will be hashed by pre-save hook)
    await user.save();
    console.log('User registered successfully:', user._id);

    // Create and return JWT token with consistent format
    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        profile: user.profile,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Format email consistently
    const formattedEmail = email.toLowerCase().trim();
    console.log('Formatted email:', formattedEmail);
    
    // Check if user exists
    const user = await User.findOne({ email: formattedEmail });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', formattedEmail);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password using bcrypt
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Invalid credentials - passwords did not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token with consistent format
    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    console.log('Login successful for user:', user._id);

    // Return user data without sensitive information
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        profile: user.profile,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Get profile request - user id:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found for id:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      isPremium: user.isPremium,
      createdAt: user.createdAt,
      profile: user.profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    console.log('Update profile request body:', req.body);
    console.log('User ID from token:', req.user.id);
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ message: 'Profile data is required' });
    }

    // Validate required fields
    if (!profile.name || !profile.age || !profile.height || !profile.weight || !profile.targetWeight) {
      return res.status(400).json({ message: 'Name, age, height, weight, and target weight are required' });
    }

    // Validate numeric fields
    if (profile.age < 13 || profile.age > 120) {
      return res.status(400).json({ message: 'Age must be between 13 and 120' });
    }

    if (profile.height < 100 || profile.height > 250) {
      return res.status(400).json({ message: 'Height must be between 100 and 250 cm' });
    }

    if (profile.weight < 30 || profile.weight > 300) {
      return res.status(400).json({ message: 'Weight must be between 30 and 300 kg' });
    }

    if (profile.targetWeight < 30 || profile.targetWeight > 300) {
      return res.status(400).json({ message: 'Target weight must be between 30 and 300 kg' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    user.name = profile.name.trim();
    user.profile = {
      ...user.profile,
      name: profile.name.trim(),
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      targetWeight: profile.targetWeight,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      stats: {
        ...user.profile.stats,
        ...profile.stats
      }
    };

    // If weight changed, add to weight logs
    if (profile.weight && profile.weight !== user.profile.weight) {
      if (!user.profile.stats.weightLogs) {
        user.profile.stats.weightLogs = [];
      }
      user.profile.stats.weightLogs.push({
        weight: profile.weight,
        date: new Date()
      });
    }

    await user.save();

    res.json({
      id: user._id,
      email: user.email,
      isPremium: user.isPremium,
      createdAt: user.createdAt,
      profile: user.profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', auth, (req, res) => {
  try {
    // In a real application, you might want to invalidate the token here
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 