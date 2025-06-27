const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const config = require('./config');

// Test data
const user = await User.findOne({ email: 'newSample@gmail.com' });
console.log('User:', user.email);
console.log('comparePassword function type:', typeof user.comparePassword);

const match = await user.comparePassword('wrong-password');
console.log('Password match:', match);


testAuth(); 