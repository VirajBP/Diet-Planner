const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const config = require('../config');
// import {comparePassword} from '../models/User';

// Register User
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      height,
      weight,
      age,
      gender,
      activityLevel,
      goal,
      dietaryRestrictions,
      allergies,
      notificationsEnabled,
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
    // Create new user
    user = new User({
      email,
      password: hashedPassword,
      profile: {
        name,
        height,
        weight,
        age,
        gender,
        activityLevel,
        goal,
        targetWeight,
        dietaryRestrictions: dietaryRestrictions || [],
      },
      preferences: {
        allergies: allergies || [],
        notifications: notificationsEnabled ?? true,
      }
    });
    

    // Save user
    
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Return user data and token
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goal: user.goal,
        targetWeight: user.targetWeight,
        dietaryRestrictions: user.dietaryRestrictions,
        allergies: user.allergies,
        notificationsEnabled: user.notificationsEnabled,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Return user data and token
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goal: user.goal,
        targetWeight: user.targetWeight,
        dietaryRestrictions: user.dietaryRestrictions,
        allergies: user.allergies,
        notificationsEnabled: user.notificationsEnabled,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get User Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update User Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow updates to password through this route
    delete updates.password;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update Password
router.put('/password', auth, async (req, res) => {
  try {
    console.log('[Password Update] Request body:', req.body);
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('[Password Update] User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    console.log('[Password Update] User found:', user?.email);
console.log('[Password Update] comparePassword type:', typeof user?.comparePassword);

    if (!isMatch) {
      console.log('[Password Update] Incorrect current password for user:', user.email);
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();
    console.log('[Password Update] Password updated for user:', user.email);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[Password Update] Update password error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

module.exports = router; 