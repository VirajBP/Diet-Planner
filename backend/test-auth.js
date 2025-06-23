const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const config = require('./config');

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  profile: {
    name: 'Test User',
    age: 25,
    gender: 'male',
    height: 175,
    weight: 70,
    targetWeight: 65,
    activityLevel: 'moderate',
    goal: 'lose',
    dietaryRestrictions: []
  }
};

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clean up any existing test user
    await User.deleteOne({ email: testUser.email });
    console.log('Cleaned up existing test user');

    // Test registration
    console.log('\n=== Testing Registration ===');
    const user = new User({
      email: testUser.email,
      password: testUser.password,
      profile: testUser.profile
    });

    await user.save();
    console.log('User registered successfully:', user._id);
    console.log('Password hash:', user.password.substring(0, 20) + '...');

    // Test login
    console.log('\n=== Testing Login ===');
    const foundUser = await User.findOne({ email: testUser.email });
    console.log('User found:', foundUser ? 'Yes' : 'No');

    if (foundUser) {
      const isMatch = await bcrypt.compare(testUser.password, foundUser.password);
      console.log('Password match:', isMatch);

      if (isMatch) {
        const token = jwt.sign(
          { id: foundUser._id },
          config.jwtSecret,
          { expiresIn: config.jwtExpiresIn }
        );
        console.log('Token generated:', token.substring(0, 20) + '...');
      }
    }

    // Test with wrong password
    console.log('\n=== Testing Wrong Password ===');
    const wrongMatch = await bcrypt.compare('wrongpassword', foundUser.password);
    console.log('Wrong password match:', wrongMatch);

    console.log('\n=== Test Complete ===');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAuth(); 