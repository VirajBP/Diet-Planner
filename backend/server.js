const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const paymentsRoutes = require('./routes/payments')

const app = express();

// Middleware
app.use(cors()); // Allow all origins in development
app.use(express.json());

// API Routes prefix
app.use('/api', (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/meal-packages', require('./routes/mealPackages'));
app.use('/api/water-logs', require('./routes/waterLogs'));
app.use('/api/weight-logs', require('./routes/weightLogs'));
app.use('/api/grocery-lists', require('./routes/groceryLists'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', paymentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: err.message });
});

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Initial database connection
connectDB();

// Handle MongoDB connection errors
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

// Start server
const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed through app termination');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}); 