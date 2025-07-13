const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account with this email exists, you will receive a password reset link shortly.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Create deep link reset URL
    const resetUrl = `nutripulse://reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your NutriPulse Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2ECC71; margin-bottom: 10px;">NutriPulse</h2>
            <h3 style="color: #333;">Password Reset Request</h3>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              You requested a password reset for your NutriPulse account.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              <strong>On your mobile device, tap the button below to open the NutriPulse app and reset your password:</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2ECC71; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 25px; font-size: 16px; 
                      font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="color: #856404; font-size: 14px; margin: 0;">
              <strong>Important:</strong> This link expires in 1 hour. If you didn't request this password reset, 
              please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              If the button doesn't work, copy and paste this link into your mobile browser:<br>
              <a href="${resetUrl}" style="color: #2ECC71;">${resetUrl}</a>
            </p>
            <p style="color: #666; font-size: 12px; text-align: center;">
              <strong>Note:</strong> This link only works on devices with the NutriPulse app installed.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
    
    res.json({ 
      message: 'If an account with this email exists, you will receive a password reset link shortly.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // If email fails, still return success to prevent email enumeration
    res.json({ 
      message: 'If an account with this email exists, you will receive a password reset link shortly.'
    });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 