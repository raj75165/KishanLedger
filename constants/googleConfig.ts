/**
 * Google OAuth 2.0 Configuration for Google Drive Backup
 *
 * Setup instructions:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project (or select an existing one)
 * 3. Enable "Google Drive API" under APIs & Services > Library
 * 4. Go to APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client IDs
 * 5. Create credentials for:
 *    - Android (package: app.rork.farmer_implements_app_pweswo4)
 *    - iOS (bundle ID: app.rork.farmer-implements-app-pweswo4)
 *    - Web application
 * 6. Set the values as environment variables in a .env file (see .env.example)
 *
 * For development with Expo Go:
 *   - Add https://auth.expo.io/@<your-expo-username>/kishan-diary-app-pweswo4 to the
 *     list of authorized redirect URIs in the Web client
 */
export const GOOGLE_CONFIG = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  scopes: [
    'openid',
    'email',
    'https://www.googleapis.com/auth/drive.appdata',
  ],
};
