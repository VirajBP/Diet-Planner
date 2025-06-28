# Automatic Login Feature

## Overview
The Diet Planner app now includes automatic login functionality that allows users to be redirected directly to the home page if they were previously logged in and didn't explicitly logout.

## How It Works

### 1. Token Persistence
- When a user successfully logs in, their authentication token is stored in AsyncStorage
- The token persists across app restarts and device reboots
- The token is only cleared when the user explicitly logs out or if it becomes invalid

### 2. App Startup Flow
When the app starts, the following sequence occurs:

1. **Splash Screen**: Shows while checking authentication and onboarding status
2. **Onboarding Check**: If the user hasn't seen onboarding, they're directed to the onboarding flow
3. **Authentication Check**: If onboarding is complete, the app checks for a stored token
4. **Token Validation**: If a token exists, it's validated by making a profile request to the server
5. **Automatic Redirect**: If the token is valid, the user is automatically redirected to the home screen

### 3. Error Handling
The system handles various scenarios:

- **Invalid/Expired Token**: Automatically clears the token and redirects to login
- **Network Issues**: Keeps the token but doesn't set user state, allowing retry when connection is restored
- **Server Errors**: Handles gracefully with appropriate error messages

## Implementation Details

### Key Components

1. **AuthContext** (`app/context/AuthContext.jsx`)
   - Manages authentication state
   - Handles token storage and validation
   - Provides `loadUser()` method for automatic login
   - Includes `refreshUser()` method for manual session refresh

2. **RootNavigator** (`app/navigation/index.jsx`)
   - Determines which screen to show based on authentication and onboarding status
   - Implements conditional routing logic

3. **SplashScreen** (`app/components/SplashScreen.jsx`)
   - Shows during the loading phase
   - Provides visual feedback while checking authentication status

### Navigation Logic
```javascript
// Simplified logic in RootNavigator
if (authLoading || onboardingLoading) {
  return <SplashScreen />;
}

if (!hasSeenOnboarding) {
  return <OnboardingScreen />;
} else if (user) {
  return <MainStack />; // Home screen with tabs
} else {
  return <AuthStack />; // Login/Register screens
}
```

## User Experience

### For New Users
1. App starts → Onboarding screen
2. Complete onboarding → Login/Register screen
3. Login/Register → Home screen
4. Future app starts → Direct to home screen

### For Returning Users
1. App starts → Splash screen (brief)
2. Automatic token validation → Home screen
3. No login required unless they explicitly logged out

### For Logged Out Users
1. App starts → Splash screen (brief)
2. No valid token found → Login screen
3. Login required to access the app

## Security Considerations

- Tokens are stored securely in AsyncStorage
- Token validation occurs on every app start
- Invalid tokens are automatically cleared
- Network errors don't compromise security
- Users can still manually logout to clear their session

## Testing

To test the automatic login feature:

1. **Login to the app** with valid credentials
2. **Close the app completely** (force stop)
3. **Reopen the app** - you should be automatically redirected to the home screen
4. **Logout manually** - this should clear the token
5. **Close and reopen** - you should now see the login screen

## Troubleshooting

If automatic login isn't working:

1. Check that the backend server is running
2. Verify network connectivity
3. Check console logs for authentication errors
4. Try manually logging out and back in
5. Clear app data if necessary (this will reset all stored data) 