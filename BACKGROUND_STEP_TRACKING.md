# Background Step Tracking Implementation

This implementation provides full background step tracking for your React Native app, similar to Google Fit. The step tracking continues even when the app is minimized or killed.

## Features

✅ **Background Tracking**: Steps are tracked even when the app is not active
✅ **Persistent Storage**: Step data is saved locally using AsyncStorage
✅ **Cross-Platform**: Works on iOS and Android with web fallback
✅ **Permission Handling**: Automatic permission requests for both platforms
✅ **Daily Reset**: Steps automatically reset at midnight
✅ **Error Handling**: Graceful fallbacks when pedometer is not available

## How It Works

### 1. Background Service (`backgroundStepTracker.js`)
- Uses `expo-task-manager` to register background tasks
- Uses `expo-sensors` Pedometer for step detection
- Uses `expo-background-fetch` for periodic updates
- Stores data in AsyncStorage for persistence

### 2. Custom Hook (`useStepTracking.js`)
- Provides a clean interface for components
- Manages tracking state and error handling
- Handles initialization and cleanup
- Provides fallback simulation for web

### 3. Updated Component (`StepTracker.jsx`)
- Uses the new background tracking system
- Shows tracking status and loading states
- Maintains the same UI with enhanced functionality

## Installation

The required dependencies have been installed:

```bash
npm install expo-sensors expo-task-manager expo-background-fetch expo-location
```

## Configuration

### App Configuration (`app.config.js`)

The app configuration has been updated with:

1. **Android Permissions**:
   - `ACTIVITY_RECOGNITION` - For step detection
   - `ACCESS_FINE_LOCATION` - For background tracking
   - `ACCESS_COARSE_LOCATION` - For location-based tracking
   - `ACCESS_BACKGROUND_LOCATION` - For background location

2. **iOS Configuration**:
   - Location usage descriptions
   - Background modes for location and background fetch

3. **Plugins**:
   - `expo-sensors`
   - `expo-task-manager`
   - `expo-background-fetch`
   - `expo-location`

## Usage

### Basic Usage

```jsx
import { useStepTracking } from '../hooks/useStepTracking';

const MyComponent = () => {
  const {
    steps,
    isTracking,
    isAvailable,
    loading,
    error,
    resetSteps,
    simulateStep,
  } = useStepTracking();

  return (
    <View>
      <Text>Steps: {steps}</Text>
      <Text>Tracking: {isTracking ? 'Yes' : 'No'}</Text>
      <Text>Available: {isAvailable ? 'Yes' : 'No'}</Text>
    </View>
  );
};
```

### Using the StepTracker Component

```jsx
import StepTracker from '../components/StepTracker';

const MyScreen = () => {
  const handleStepUpdate = (steps) => {
    console.log('Steps updated:', steps);
  };

  return (
    <StepTracker onStepUpdate={handleStepUpdate} />
  );
};
```

## Testing

### Debug Component

Use the `StepTrackerTest` component to debug and test the background tracking:

```jsx
import StepTrackerTest from '../components/StepTrackerTest';

// Add to your screen for testing
<StepTrackerTest />
```

### Testing Background Tracking

1. **Start the app** and ensure step tracking is initialized
2. **Minimize the app** (don't force close)
3. **Walk around** for a few minutes
4. **Return to the app** - you should see updated step counts

### Testing App Kill/Reload

1. **Start tracking** in the app
2. **Force close** the app completely
3. **Walk around** for a few minutes
4. **Reopen the app** - steps should be restored from storage

## Platform-Specific Behavior

### iOS
- Requires location permissions for background tracking
- Background fetch runs every 15+ minutes (system controlled)
- More restrictive background execution

### Android
- Requires activity recognition permission
- More reliable background execution
- Better battery optimization handling

### Web
- Falls back to simulation mode
- No real pedometer available
- Manual step simulation only

## Troubleshooting

### Common Issues

1. **Steps not updating in background**
   - Check if location permissions are granted
   - Ensure app is not force-closed (minimize instead)
   - Verify background modes are enabled in device settings

2. **Permission denied**
   - The app will show appropriate error messages
   - Users can manually grant permissions in device settings

3. **Battery optimization**
   - Some devices may restrict background execution
   - Users may need to disable battery optimization for the app

### Debug Information

The `StepTrackerTest` component shows:
- Current step count
- Tracking status
- Availability status
- Loading state
- Any errors

## API Reference

### useStepTracking Hook

```typescript
interface StepTrackingResult {
  steps: number;                    // Current step count
  isTracking: boolean;              // Whether tracking is active
  isAvailable: boolean;             // Whether pedometer is available
  loading: boolean;                 // Loading state
  error: string | null;             // Error message if any
  resetSteps: () => Promise<void>;  // Reset step count
  simulateStep: () => void;         // Simulate a step (web only)
  stopTracking: () => Promise<void>; // Stop tracking
  getStepHistory: () => Promise<any>; // Get step history
  initializeTracking: () => Promise<void>; // Re-initialize tracking
}
```

### BackgroundStepTracker Service

```typescript
class BackgroundStepTracker {
  async initialize(onStepUpdateCallback?: (steps: number) => void): Promise<void>
  async getCurrentSteps(): Promise<number>
  async resetSteps(): Promise<void>
  async stopTracking(): Promise<void>
  async getStepHistory(): Promise<any>
}
```

## Storage Format

Step data is stored in AsyncStorage with the following format:

```json
{
  "dailySteps": 5432,
  "currentSteps": 5432,
  "lastStepCount": 5432,
  "lastUpdate": 1703123456789
}
```

## Performance Considerations

- Background tasks run every 15+ minutes (system controlled)
- Data is saved to AsyncStorage on each step update
- Battery usage is optimized for minimal impact
- Location services are only used when necessary

## Security & Privacy

- Step data is stored locally only
- No step data is transmitted to external servers
- Location permissions are only used for background tracking
- Users can revoke permissions at any time

## Future Enhancements

Potential improvements:
- Step goal notifications
- Weekly/monthly step statistics
- Integration with health platforms (HealthKit, Google Fit)
- Custom background task intervals
- Step streak tracking 