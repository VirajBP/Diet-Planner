// Returns an object with min and max expected BMI for a given age
export function getExpectedBMIRange(age) {
  // Source: WHO and CDC general guidelines
  // For adults (age >= 20), normal BMI is 18.5 - 24.9
  // For children/teens, BMI-for-age percentiles are used, but we'll simplify:
  if (age >= 20) {
    return { min: 18.5, max: 24.9 };
  } else if (age >= 2 && age < 20) {
    // For children/teens, use a rougher range (actual is percentile-based)
    // We'll use 15-22 as a general healthy range for demonstration
    return { min: 15, max: 22 };
  } else {
    // For infants/toddlers, BMI is not typically used
    return { min: null, max: null };
  }
} 