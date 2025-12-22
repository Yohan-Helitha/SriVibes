# SriVibes Mobile App

React Native mobile application built with Expo.

## 📱 Project Structure

```
apps/mobile/
├── src/
│   ├── screens/          # All screen components
│   │   ├── Onboarding01.tsx
│   │   ├── Onboarding02.tsx
│   │   └── LoginScreen.tsx
│   ├── components/       # Reusable UI components
│   ├── navigation/       # Navigation configuration
│   └── theme/           # Colors, fonts, styles
│       └── colors.ts
├── assets/              # Images, icons, fonts
├── App.tsx             # Root component
├── app.json            # Expo configuration
└── package.json        # Dependencies

```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
cd apps/mobile
npm install
```

### Run the App

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Using Expo Go
1. Install Expo Go app on your phone
2. Scan the QR code from the terminal
3. The app will load on your device

## 🎨 Screens

### Onboarding Flow
- **Onboarding01**: Welcome screen with SriVibes branding
- **Onboarding02**: Feature introduction with "Ayubowan!" greeting
- **LoginScreen**: User authentication screen

All screens use the SriVibes blue theme (#008CD8) with gradient backgrounds.

## 🔧 Development

- All screens are in `src/screens/`
- Theme colors defined in `src/theme/colors.ts`
- Ready for Socket.IO integration for real-time bus tracking

## 📦 Dependencies

- **expo**: ~50.0.0
- **react-native**: 0.73.0
- **expo-linear-gradient**: Gradient backgrounds
- **socket.io-client**: Real-time communication (ready to use)

## 🎯 Next Steps

1. Add proper authentication flow
2. Implement home screen with bus/restaurant listings
3. Add Socket.IO connection for live tracking
4. Integrate with backend API
5. Add booking screens
6. Implement QR code scanning for conductors
