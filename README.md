# Yooli Backend API

A comprehensive NestJS backend for the Yooli mobile app featuring real-time messaging, WebRTC calling, and push notifications.

## Features

- 🔐 **Authentication**: JWT-based authentication with user registration and login
- 💬 **Real-time Messaging**: WebSocket-powered chat with message history and read receipts
- 📞 **WebRTC Calling**: Audio/video calling with signaling server
- 🔔 **Push Notifications**: Firebase Cloud Messaging for background notifications
- 👥 **User Management**: User profiles, status tracking, and presence indicators
- 📊 **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **Real-time**: Socket.IO
- **Push Notifications**: Firebase Admin SDK
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Auth guards (JWT, Local)
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # User management module
│   ├── dto/             # User DTOs
│   ├── schemas/         # User schema
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── messages/            # Messaging module
│   ├── dto/             # Message DTOs
│   ├── schemas/         # Message schema
│   ├── messages.controller.ts
│   ├── messages.service.ts
│   ├── messages.gateway.ts  # WebSocket gateway
│   └── messages.module.ts
├── calls/               # WebRTC calling module
│   ├── dto/             # Call DTOs
│   ├── schemas/         # Call schema
│   ├── calls.controller.ts
│   ├── calls.service.ts
│   ├── calls.gateway.ts     # WebRTC signaling
│   └── calls.module.ts
├── notifications/       # Push notifications module
│   ├── notifications.service.ts
│   └── notifications.module.ts
├── database/            # Database configuration
│   └── database.module.ts
├── app.module.ts        # Main app module
└── main.ts             # Application entry point
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Firebase project (for push notifications)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp env.example .env
   ```

3. **Configure environment variables** in `.env`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/yooli-app
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Firebase Configuration (for push notifications)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:8081,exp://192.168.1.100:8081
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Run the application**:
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/online` - Get online users
- `PATCH /api/v1/users/me` - Update user profile
- `PATCH /api/v1/users/me/status` - Update user status
- `POST /api/v1/users/me/fcm-token` - Add FCM token
- `DELETE /api/v1/users/me/fcm-token` - Remove FCM token

### Messages
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/conversations` - Get user conversations
- `GET /api/v1/messages/conversation/:userId` - Get conversation with user
- `GET /api/v1/messages/unread-count` - Get unread messages count
- `PATCH /api/v1/messages/:id/read` - Mark message as read
- `DELETE /api/v1/messages/:id` - Delete message

### Calls
- `POST /api/v1/calls` - Initiate call
- `GET /api/v1/calls/history` - Get call history
- `GET /api/v1/calls/active` - Get active call
- `PATCH /api/v1/calls/:id/answer` - Answer call
- `PATCH /api/v1/calls/:id/decline` - Decline call
- `PATCH /api/v1/calls/:id/end` - End call

## WebSocket Events

### Messaging Events
- `sendMessage` - Send a message
- `newMessage` - Receive new message
- `markAsRead` - Mark message as read
- `typing` - User typing indicator
- `userOnline` - User came online
- `userOffline` - User went offline

### Call Events
- `initiateCall` - Start a call
- `incomingCall` - Receive call invitation
- `answerCall` - Answer incoming call
- `declineCall` - Decline incoming call
- `endCall` - End active call
- `iceCandidate` - Exchange ICE candidates
- `callAnswered` - Call was answered
- `callDeclined` - Call was declined
- `callEnded` - Call ended

## Firebase Setup

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Cloud Messaging

2. **Generate Service Account**:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file

3. **Configure Environment**:
   - Extract values from the JSON file
   - Add them to your `.env` file

## Frontend Integration

### Socket.IO Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    userId: 'your-user-id'
  }
});

// Listen for messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Send message
socket.emit('sendMessage', {
  receiverId: 'receiver-user-id',
  content: 'Hello!',
  type: 'text'
});
```

### WebRTC Integration
```javascript
// Initiate call
socket.emit('initiateCall', {
  receiverId: 'receiver-user-id',
  type: 'video',
  offer: sdpOffer
});

// Listen for incoming calls
socket.on('incomingCall', (data) => {
  console.log('Incoming call from:', data.caller);
  // Show call UI
});

// Answer call
socket.emit('answerCall', {
  callId: 'call-id',
  answer: sdpAnswer
});
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **API JSON**: http://localhost:3000/api/docs-json

## Development

### Available Scripts
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### Database Schema

#### User Schema
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String (optional),
  phoneNumber: String (optional),
  status: Enum ['online', 'offline', 'in_call', 'away'],
  lastSeen: Date,
  fcmTokens: [String],
  isActive: Boolean,
  socketId: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Message Schema
```javascript
{
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  content: String,
  type: Enum ['text', 'image', 'audio', 'video', 'file'],
  status: Enum ['sent', 'delivered', 'read'],
  mediaUrl: String (optional),
  fileName: String (optional),
  fileSize: Number (optional),
  isEdited: Boolean,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Call Schema
```javascript
{
  callerId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  type: Enum ['audio', 'video'],
  status: Enum ['initiated', 'ringing', 'answered', 'ended', 'missed', 'declined'],
  startTime: Date,
  endTime: Date,
  duration: Number (seconds),
  offer: String (WebRTC offer),
  answer: String (WebRTC answer),
  iceCandidates: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

### Production Considerations

1. **Environment Variables**: Ensure all production environment variables are set
2. **Database**: Use MongoDB Atlas or a production MongoDB instance
3. **Security**: 
   - Use strong JWT secrets
   - Enable HTTPS
   - Configure proper CORS origins
4. **Monitoring**: Add logging and monitoring solutions
5. **Scaling**: Consider using Redis for session storage and Socket.IO scaling

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Firebase Errors**: Verify Firebase service account credentials
3. **CORS Issues**: Check CORS_ORIGIN environment variable
4. **WebSocket Connection**: Ensure Socket.IO client version compatibility

### Logs
Check application logs for detailed error information:
```bash
npm run start:dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 