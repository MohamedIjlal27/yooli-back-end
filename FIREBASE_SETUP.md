# Firebase Setup Guide for Yooli Backend

## Step 1: Create Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create Project**:
   - Click "Create a project"
   - Enter project name: `yooli-app` (or your preferred name)
   - Choose Google Analytics settings (optional)
   - Click "Create project"

## Step 2: Enable Cloud Messaging

1. **Navigate to Cloud Messaging**:
   - In Firebase console, go to "Build" → "Cloud Messaging"
   - The service should be automatically enabled

## Step 3: Generate Service Account Key

1. **Project Settings**:
   - Click gear icon ⚙️ → "Project settings"
   - Go to "Service accounts" tab
   - Click "Generate new private key"
   - **Download and save the JSON file securely**

## Step 4: Extract Configuration Values

From your downloaded JSON file, extract these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",           // → FIREBASE_PROJECT_ID
  "private_key_id": "key-id",                // → FIREBASE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...", // → FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxx@project.iam.gserviceaccount.com", // → FIREBASE_CLIENT_EMAIL
  "client_id": "client-id",                  // → FIREBASE_CLIENT_ID
  "auth_uri": "https://accounts.google.com/o/oauth2/auth", // → FIREBASE_AUTH_URI
  "token_uri": "https://oauth2.googleapis.com/token" // → FIREBASE_TOKEN_URI
}
```

## Step 5: Configure Environment Variables

Create `.env` file in your backend directory:

```bash
cp env.example .env
```

Then update your `.env` file with the Firebase values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/yooli-app
DATABASE_NAME=yooli-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY_ID=your-actual-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-actual-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-actual-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# CORS Configuration
CORS_ORIGIN=http://localhost:8081,exp://192.168.1.100:8081
```

## Step 6: Frontend Configuration (React Native)

### Install Firebase SDK in your frontend:
```bash
cd frontend
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Add Firebase config to your React Native app:

1. **Android Setup**:
   - Download `google-services.json` from Firebase Console
   - Place it in `android/app/google-services.json`
   - Add to `android/build.gradle`:
     ```gradle
     dependencies {
         classpath 'com.google.gms:google-services:4.3.15'
     }
     ```
   - Add to `android/app/build.gradle`:
     ```gradle
     apply plugin: 'com.google.gms.google-services'
     ```

2. **iOS Setup**:
   - Download `GoogleService-Info.plist` from Firebase Console
   - Add it to your iOS project in Xcode

### Frontend Integration Example:

```javascript
// In your React Native app
import messaging from '@react-native-firebase/messaging';

// Request permission
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFCMToken();
  }
};

// Get FCM token
const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    
    // Send token to your backend
    await fetch('http://localhost:3000/api/v1/users/me/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourJWTToken}`,
      },
      body: JSON.stringify({ fcmToken: token }),
    });
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
};

// Listen for messages
messaging().onMessage(async remoteMessage => {
  console.log('Foreground message:', remoteMessage);
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
});
```

## Step 7: Test the Setup

1. **Start your backend**:
   ```bash
   npm run start:dev
   ```

2. **Test notification endpoint** (using curl or Postman):
   ```bash
   curl -X POST http://localhost:3000/api/v1/users/me/fcm-token \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"fcmToken": "your-fcm-token"}'
   ```

## Step 8: Notification Channels (Android)

For Android, create notification channels in your React Native app:

```javascript
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

if (Platform.OS === 'android') {
  PushNotification.createChannel(
    {
      channelId: 'calls',
      channelName: 'Call Notifications',
      channelDescription: 'Notifications for incoming calls',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`Channel created: ${created}`)
  );
}
```

## Troubleshooting

### Common Issues:

1. **Firebase initialization error**:
   - Check that all environment variables are correctly set
   - Ensure private key format is correct (with \n for line breaks)

2. **Token registration fails**:
   - Verify FCM is enabled in Firebase Console
   - Check network connectivity
   - Ensure proper permissions on mobile device

3. **Notifications not received**:
   - Check if app is in foreground/background
   - Verify notification channels (Android)
   - Test with Firebase Console test message

### Testing with Firebase Console:

1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter title and text
4. Select your app
5. Send test message

## Security Notes

- **Never commit** your `.env` file or Firebase service account JSON
- **Use different Firebase projects** for development and production
- **Rotate service account keys** periodically
- **Limit service account permissions** to only what's needed

## Production Considerations

- Use Firebase project for production environment
- Set up proper monitoring and logging
- Consider using Firebase Functions for complex notification logic
- Implement proper error handling and retry mechanisms 