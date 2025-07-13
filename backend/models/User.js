const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 13,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    height: {
      type: Number,
      required: true,
      min: 100,
      max: 250,
    },
    weight: {
      type: Number,
      required: true,
      min: 30,
      max: 300,
    },
    targetWeight: {
      type: Number,
      required: true,
      min: 30,
      max: 300,
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      required: true,
    },
    goal: {
      type: String,
      enum: ['lose', 'maintain', 'gain'],
      required: true,
    },
    dietaryRestrictions: {
      type: [String],
      enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free'],
      default: []
    },
    stats: {
      totalCaloriesBurned: {
        type: Number,
        default: 0
      },
      totalWorkouts: {
        type: Number,
        default: 0
      },
      streakDays: {
        type: Number,
        default: 0
      },
      weightLogs: [{
        weight: Number,
        date: {
          type: Date,
          default: Date.now
        }
      }],
      lastWorkout: {
        type: Date,
        default: null
      }
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    measurementUnit: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    allergies: {
      type: [String],
      default: [],
    },
    mealPreferences: {
      type: [String],
      default: [],
    },
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  premiumExpiryDate: {
    type: Date,
  },
  premiumTrialStartDate: { type: Date },
  premiumTrialUsed: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Virtual for user's full name
userSchema.virtual('name').get(function() {
  return this.profile.name;
});

// Add index for faster queries
userSchema.index({ email: 1 });

// Add initial weight log when creating a new user
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.profile.stats.weightLogs.push({
      weight: this.profile.weight,
      date: new Date()
    });
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and not already hashed
  if (this.isModified('password') && !this.password.startsWith('$2a$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Update the updatedAt timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate daily calorie needs
userSchema.methods.calculateDailyCalories = function() {
  // BMR calculation using Mifflin-St Jeor Equation
  let bmr;
  if (this.profile.gender === 'male') {
    bmr = 10 * this.profile.weight + 6.25 * this.profile.height - 5 * this.profile.age + 5;
  } else {
    bmr = 10 * this.profile.weight + 6.25 * this.profile.height - 5 * this.profile.age - 161;
  }

  // Activity level multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  let tdee = bmr * activityMultipliers[this.profile.activityLevel];

  // Adjust based on goal
  switch (this.profile.goal) {
    case 'lose':
      tdee -= 500; // Create a 500 calorie deficit
      break;
    case 'gain':
      tdee += 500; // Create a 500 calorie surplus
      break;
    // maintain stays the same
  }

  return Math.round(tdee);
};

// Method to return user data without sensitive information
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 