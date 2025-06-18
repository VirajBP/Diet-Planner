const validateRegistration = (req, res, next) => {
  const { email, password, profile } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Validate profile
  if (!profile) {
    return res.status(400).json({ message: 'Profile data is required' });
  }

  // Required profile fields
  const requiredFields = [
    'name',
    'age',
    'gender',
    'height',
    'weight',
    'targetWeight',
    'activityLevel'
  ];

  // Check for missing fields
  const missingFields = requiredFields.filter(field => !profile[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required profile fields: ${missingFields.join(', ')}`
    });
  }

  // Validate numeric fields
  const numericFields = {
    age: { min: 13, max: 120 },
    height: { min: 100, max: 250 },
    weight: { min: 30, max: 300 },
    targetWeight: { min: 30, max: 300 }
  };

  for (const [field, range] of Object.entries(numericFields)) {
    const value = parseInt(profile[field]);
    if (isNaN(value) || value < range.min || value > range.max) {
      return res.status(400).json({
        message: `Invalid ${field}: must be between ${range.min} and ${range.max}`
      });
    }
  }

  // Validate gender
  if (!['male', 'female', 'other'].includes(profile.gender.toLowerCase())) {
    return res.status(400).json({
      message: 'Invalid gender: must be male, female, or other'
    });
  }

  // Validate activity level
  const validActivityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
  if (!validActivityLevels.includes(profile.activityLevel.toLowerCase())) {
    return res.status(400).json({
      message: `Invalid activity level: must be one of ${validActivityLevels.join(', ')}`
    });
  }

  next();
};

module.exports = {
  validateRegistration
}; 