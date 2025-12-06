# Mood Tracker - React Native Expo App

A beautiful, native mobile mood tracking app built with React Native and Expo. Track your daily mood with an intuitive slider interface, view your mood history in list or calendar format, and enjoy smooth animations and color transitions.

## Features

- **Real-time Mood Tracking**: Drag the slider to select your mood (1-10) with instant visual feedback
- **Dynamic Background**: Gradient background that changes color based on your mood
- **Animated Emoji**: Large emoji (120-140px) that updates with smooth animations
- **Mood History**: View past entries in both list and calendar views
- **Local Storage**: All data persisted locally using AsyncStorage
- **Smooth Animations**: Powered by React Native Reanimated for 60fps interactions
- **Native Feel**: Built with React Native components for authentic mobile experience

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (for Mac) or **Expo Go** app on your iPhone
- **Xcode** (for iOS development on Mac)

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd "/Users/kushjain/Desktop/Voding 1/Toke App v02 12.06"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install iOS pods** (if on Mac and using iOS simulator):
   ```bash
   cd ios && pod install && cd ..
   ```
   (Note: This step is only needed if you're building a native iOS app. For Expo Go, you can skip this.)

## Running the App

### Option 1: Using Expo Go (Recommended for Quick Testing)

1. **Start the Expo development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   expo start
   ```

2. **On your iPhone:**
   - Install the **Expo Go** app from the App Store
   - Scan the QR code displayed in the terminal or browser
   - The app will load on your device

### Option 2: Using iOS Simulator (Mac only)

1. **Start the Expo development server:**
   ```bash
   npm start
   ```

2. **Press `i` in the terminal** to open the iOS simulator, or click the iOS option in the Expo Dev Tools

3. The app will launch in the iOS Simulator

### Option 3: Using Physical iPhone (Development Build)

1. **Build and run on your device:**
   ```bash
   npm run ios
   ```

## Project Structure

```
.
├── App.tsx                    # Main entry point with navigation
├── src/
│   ├── screens/
│   │   ├── MoodTrackerScreen.tsx    # Main mood tracking interface
│   │   └── HistoryScreen.tsx         # History view with list/calendar toggle
│   ├── components/
│   │   ├── MoodSlider.tsx            # Custom slider component
│   │   ├── MoodEmoji.tsx             # Animated emoji display
│   │   └── GradientBackground.tsx    # Dynamic gradient background
│   ├── utils/
│   │   ├── storage.ts                # AsyncStorage helper functions
│   │   ├── colors.ts                  # Color interpolation utilities
│   │   └── emojiMap.ts                # Emoji mapping logic
│   └── types/
│       └── mood.ts                   # TypeScript interfaces
├── package.json
├── tsconfig.json
├── app.json
└── babel.config.js
```

## Key Technologies

- **React Native**: Mobile app framework
- **Expo**: Development platform and toolchain
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Screen navigation
- **React Native Reanimated**: Smooth animations
- **React Native Gesture Handler**: Touch interactions
- **AsyncStorage**: Local data persistence
- **Expo Linear Gradient**: Gradient backgrounds
- **date-fns**: Date formatting utilities

## Usage

### Tracking Your Mood

1. Open the app to see the main mood tracker screen
2. Drag the slider horizontally to select your mood (1-10)
3. Watch the emoji and background color update in real-time
4. Tap "Log Mood" to save your entry
5. You'll see a confirmation message when saved

### Viewing History

1. Tap the calendar icon (📅) in the top right corner
2. Toggle between "List" and "Calendar" views using the buttons
3. List view shows all entries sorted by most recent
4. Calendar view shows entries on specific dates
5. Navigate between months using the arrow buttons in calendar view

### Mood Scale

- **1-3**: Sad/Melancholy (Blue/Purple tones)
- **4-5**: Neutral (Purple/Lavender tones)
- **6-7**: Positive (Warm/Yellow tones)
- **8-10**: Happy/Energetic (Yellow/Green tones)

## Development

### Making Changes

The app uses hot reloading, so most changes will appear immediately. For navigation or native module changes, you may need to reload the app.

### Reloading the App

- **In Expo Go**: Shake your device and tap "Reload"
- **In Simulator**: Press `Cmd + R` (iOS) or `R` twice quickly
- **In Terminal**: Press `r` to reload

### Debugging

- Open the developer menu by shaking your device or pressing `Cmd + D` in the simulator
- Use React Native Debugger or Chrome DevTools for debugging
- Check the terminal for error messages

## Building for Production

When you're ready to build a standalone app:

```bash
# Build for iOS
expo build:ios

# Or use EAS Build (recommended)
eas build --platform ios
```

## Troubleshooting

### Common Issues

1. **"Unable to resolve module" errors:**
   - Delete `node_modules` and run `npm install` again
   - Clear Expo cache: `expo start -c`

2. **iOS Simulator not opening:**
   - Ensure Xcode is installed
   - Run `xcode-select --install` if needed
   - Try opening Simulator manually: `open -a Simulator`

3. **Metro bundler issues:**
   - Stop the server and restart: `npm start -- --reset-cache`

4. **Gesture handler not working:**
   - Ensure `react-native-gesture-handler` is properly installed
   - Check that `react-native-reanimated/plugin` is in `babel.config.js`

## Future Enhancements

The app structure is prepared for:
- Notes feature (placeholder in MoodEntry interface)
- Export/import functionality
- Statistics and insights
- Customizable themes
- Reminders and notifications

## License

This project is created for personal use.

## Support

For issues or questions, please check the Expo documentation or React Native documentation.

---

**Enjoy tracking your mood!** 🎨😊

# Toke1
