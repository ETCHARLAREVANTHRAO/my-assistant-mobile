# mobile/

Expo (React Native + TypeScript) app — runs on both Android and iOS.

## Folder Structure

```
mobile/
├── App.tsx                    ← Root: NavigationContainer + SafeAreaProvider
├── app.json                   ← Expo config (name, bundle ID, splash, icons)
├── package.json
├── tsconfig.json
└── src/
    ├── navigation/
    │   └── AppNavigator.tsx   ← Bottom tab navigator (Chat / Documents / Weather)
    ├── screens/
    │   ├── ChatScreen.tsx     ← Main chat UI with message history
    │   ├── DocumentsScreen.tsx ← Upload/list/delete Markdown files
    │   └── WeatherScreen.tsx  ← City search + weather display
    ├── components/
    │   ├── MessageBubble.tsx  ← Single chat message (user = purple, bot = dark)
    │   ├── DocumentCard.tsx   ← Row with filename + delete button
    │   └── WeatherWidget.tsx  ← Weather card (temp, description, stats)
    └── services/
        └── api.ts             ← Axios client for all backend calls
```

## Running on Your Phone (Development)

1. Install **Expo Go** on your phone:
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: App Store

2. Install dependencies:
   ```bash
   cd mobile
   npm install
   ```

3. Set the backend URL. Create `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://your-app.up.railway.app
   ```
   (For local dev, use your PC's IP: `http://192.168.1.XXX:8000` — find it with `ipconfig`)

4. Start Expo:
   ```bash
   npx expo start
   ```

5. Scan the QR code with Expo Go on your phone. The app loads instantly over WiFi.

## Design System

- Dark theme throughout: background `#1a1a2e`, cards `#2a2a3e`
- Accent color: `#6C63FF` (purple) for interactive elements
- Icons: `@expo/vector-icons` Ionicons set

## Key Files

- [src/services/api.ts](src/services/api.ts) — the single place where `BASE_URL` is set. Change this when you have a Railway URL.
- [src/screens/ChatScreen.tsx](src/screens/ChatScreen.tsx) — manages message list state, sends to `/chat`, handles loading/error states.
- [src/screens/DocumentsScreen.tsx](src/screens/DocumentsScreen.tsx) — uses `expo-document-picker` to open `.md` files from the phone's filesystem and upload them.

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build Android APK
eas build -p android --profile preview

# Build iOS (requires Apple Developer account)
eas build -p ios --profile preview
```
