# Habit Tracker Frontend

A beautiful and intuitive React Native app for tracking daily habits, built with Expo. This app allows users to create, manage, and track their daily habits with progress visualization and push notifications.

## 🚀 Features

### Core Features

- **User Authentication**: Secure JWT-based signup and login
- **Habit Management**: Create, edit, delete, and archive habits
- **Daily Tracking**: Mark habits as complete/incomplete with one tap
- **Progress Visualization**: 7-day progress charts and statistics
- **Categories & Difficulty**: Organize habits by category and difficulty level
- **Custom Colors**: Personalize habits with custom color themes

### Bonus Features

- **Push Notifications**: Daily habit reminders with Expo Notifications
- **Habit Statistics**: Detailed analytics and completion rates
- **Streak Tracking**: Monitor current and longest streaks
- **Motivational Messages**: Encouraging notifications and celebrations
- **Offline-First**: Works offline with data sync when online
- **Beautiful UI**: Modern, clean interface with smooth animations

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + Local State
- **Authentication**: JWT with AsyncStorage
- **Notifications**: Expo Notifications
- **Icons**: Expo Vector Icons
- **API**: RESTful API integration
- **TypeScript**: Full type safety

## 📱 Screenshots

_Note: Add screenshots of your app here_

## 🏗 Architecture

```
frontend/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Authentication screens
│   ├── (tabs)/              # Main app tabs
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # App entry point
├── components/              # Reusable components
│   ├── ui/                  # UI component library
│   └── HabitActions.tsx     # Habit management component
├── services/                # API and external services
│   ├── api.ts               # API service
│   ├── AuthContext.tsx      # Authentication context
│   └── notifications.ts     # Notification service
├── constants/               # App constants
├── utils/                   # Utility functions
├── hooks/                   # Custom React hooks
└── assets/                  # Images, fonts, etc.
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)
- Physical device with Expo Go app (recommended for testing)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd habit-tracker/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install additional required packages**

   ```bash
   npx expo install @react-native-async-storage/async-storage
   npx expo install expo-notifications
   npx expo install expo-device
   npx expo install react-native-chart-kit
   npx expo install react-native-svg
   ```

4. **Update API configuration**

   Update the API base URL in `services/api.ts`:

   ```typescript
   const BASE_URL = "https://your-backend-url.com/api";
   ```

   Or create a `.env` file:

   ```
   EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

### Running the App

1. **Start the development server**

   ```bash
   npx expo start
   ```

2. **Choose your platform**

   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

3. **For production builds**

   ```bash
   # iOS
   npx expo build:ios

   # Android
   npx expo build:android
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api

# App Configuration
EXPO_PUBLIC_APP_NAME=Habit Tracker
EXPO_PUBLIC_APP_VERSION=1.0.0

# Development
EXPO_PUBLIC_DEV_MODE=true
```

### Push Notifications Setup

1. **Configure app.json** (already configured)

   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-notifications",
           {
             "icon": "./assets/images/notification-icon.png",
             "color": "#6366F1"
           }
         ]
       ]
     }
   }
   ```

2. **Test notifications**
   - Notifications work on physical devices
   - iOS Simulator doesn't support push notifications
   - Android Emulator supports notifications

### Backend Integration

Ensure your backend API supports these endpoints:

```
Authentication:
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Habits:
GET    /api/habits
POST   /api/habits
PUT    /api/habits/:id
DELETE /api/habits/:id
PUT    /api/habits/:id/mark
GET    /api/habits/:id/progress
PUT    /api/habits/:id/archive
GET    /api/habits/stats
```

## 📱 Usage Guide

### User Authentication

1. **Sign Up**: Create a new account with email, password, and name
2. **Login**: Sign in with existing credentials
3. **Demo Account**: Use the provided demo credentials for testing

### Creating Habits

1. Navigate to the **Create** tab
2. Enter habit name and optional description
3. Set reminder time (optional)
4. Choose category, difficulty, and color
5. Tap **Create Habit**

### Daily Tracking

1. Go to **Dashboard**
2. Tap the circle next to any habit to mark it complete
3. View your progress statistics at the top
4. Pull down to refresh your habits

### Progress Tracking

1. Visit the **Progress** tab
2. Select a habit from the horizontal list
3. View 7-day completion history
4. Check detailed statistics including streaks and completion rates

### Managing Habits

1. From the Dashboard, tap the **⋮** menu on any habit
2. **Edit**: Modify habit details
3. **Archive**: Hide from daily list but keep progress
4. **Delete**: Permanently remove habit and all data

## 🔔 Notifications

### Setting Up Reminders

1. When creating or editing a habit, set a reminder time
2. Grant notification permissions when prompted
3. Receive daily reminders at your chosen time

### Notification Types

- **Daily Reminders**: Set custom times for each habit
- **Motivational Messages**: Encouraging notifications based on progress
- **Streak Celebrations**: Special notifications for milestone streaks
- **Progress Updates**: Daily summary notifications

## 🎨 Customization

### Themes and Colors

The app uses a consistent color scheme defined in `constants/index.ts`:

```typescript
export const COLORS = {
  primary: "#6366F1",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  // ... more colors
};
```

### Adding New Categories

Add new habit categories in `constants/index.ts`:

```typescript
export const HABIT_CATEGORIES = [
  { id: "custom", name: "Custom", icon: "star", color: "#8B5CF6" },
  // ... existing categories
];
```

## 🧪 Testing

### Demo Account

Use these credentials to test the app:

- **Email**: demo@example.com
- **Password**: demo123456

### Testing Checklist

- [ ] User registration and login
- [ ] Create new habits
- [ ] Mark habits as complete/incomplete
- [ ] View progress charts
- [ ] Edit and delete habits
- [ ] Push notifications (on physical device)
- [ ] Offline functionality
- [ ] App navigation and UI responsiveness

## 📦 Building for Production

### Prerequisites for Production

1. **Apple Developer Account** (for iOS)
2. **Google Play Console Account** (for Android)
3. **Expo Account** (for EAS Build)

### Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure the project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

### App Store Submission

1. **iOS App Store**:

   - Build with `eas build --platform ios`
   - Upload to App Store Connect
   - Complete app metadata and submit for review

2. **Google Play Store**:
   - Build with `eas build --platform android`
   - Upload AAB file to Play Console
   - Complete store listing and publish

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**

   - Check your backend URL in `services/api.ts`
   - Ensure your backend is running and accessible
   - Verify CORS settings on your backend

2. **Notification Issues**

   - Test on a physical device (not simulator)
   - Check notification permissions in device settings
   - Verify notification service setup

3. **Build Issues**

   - Clear Expo cache: `npx expo start --clear`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for conflicting dependencies

4. **Authentication Issues**
   - Clear AsyncStorage: Uninstall and reinstall the app
   - Check JWT token expiration
   - Verify backend authentication endpoints

### Getting Help

- Check the [Expo Documentation](https://docs.expo.dev/)
- React Native [Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting)
- Open an issue in the project repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use consistent naming conventions
- Add proper error handling
- Write meaningful commit messages
- Test on both iOS and Android
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **React Native Community** - For the excellent ecosystem
- **Design Inspiration** - Modern habit tracking apps and Material Design

## 📞 Support

For support and questions:

- Email: support@habittracker.com
- GitHub Issues: [Project Issues](https://github.com/your-repo/issues)
- Documentation: [Project Wiki](https://github.com/your-repo/wiki)

---

**Happy Habit Building! 🌟**

Start small, stay consistent, and watch your habits transform your life one day at a time.
