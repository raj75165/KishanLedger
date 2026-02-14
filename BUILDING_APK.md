# Building and Distributing Android APK via GitHub

This guide explains how to build and distribute your Android APK file through GitHub.

## Setup Instructions

### 1. Configure Expo Account

Before you can build APKs automatically, you need to:

1. Create an account at [expo.dev](https://expo.dev) if you don't have one
2. Create a new project or link this existing project to your Expo account
3. Generate an access token:
   - Go to [Expo Access Tokens](https://expo.dev/accounts/[account]/settings/access-tokens)
   - Click "Create Token"
   - Give it a descriptive name (e.g., "GitHub Actions")
   - Copy the token

### 2. Add GitHub Secret

Add your Expo token as a GitHub secret:

1. Go to your repository on GitHub
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Name: `EXPO_TOKEN`
5. Value: Paste your Expo access token
6. Click "Add secret"

### 3. Build Methods

Once configured, you have several ways to build APKs:

#### A. Automatic Build on Release

1. Go to the [Releases page](https://github.com/raj75165/KishanLedger/releases)
2. Click "Draft a new release"
3. Create a tag (e.g., `v1.0.0`)
4. Fill in release details
5. Click "Publish release"
6. GitHub Actions will automatically build the APK

#### B. Manual Build via GitHub Actions

1. Go to the [Actions tab](https://github.com/raj75165/KishanLedger/actions)
2. Select "Build Android APK" workflow
3. Click "Run workflow"
4. Select the branch
5. Click "Run workflow"

#### C. Local Build

```bash
# Install EAS CLI globally
bun install -g @expo/eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview

# Wait for build to complete, then download from Expo dashboard
```

## Build Profiles

The `eas.json` file defines three build profiles:

- **development**: For development with the Expo Dev Client
- **preview**: Creates an APK file for internal testing (what we use for GitHub releases)
- **production**: Creates an AAB file for Google Play Store submission

## Distributing APKs

### Via GitHub Releases (Recommended)

Users can download APKs directly from your GitHub releases:

1. Visit the [Releases page](https://github.com/raj75165/KishanLedger/releases)
2. Find the desired version
3. Download the `.apk` file
4. Install on Android device

### Via Expo Dashboard

After building locally or via CI:

1. Visit [expo.dev](https://expo.dev)
2. Go to your project
3. Navigate to "Builds"
4. Download or share the APK URL

## Installing APK on Android

To install the APK on an Android device:

1. Download the APK file
2. On your Android device, go to Settings > Security
3. Enable "Unknown sources" or "Install unknown apps" (varies by Android version)
4. Open the APK file
5. Follow the installation prompts

## Troubleshooting

### Build Fails in GitHub Actions

- **Check Expo Token**: Ensure `EXPO_TOKEN` is correctly set in repository secrets
- **Check Expo Account**: Verify your Expo account is active and has build capacity
- **Check Logs**: View detailed logs in the Actions tab

### APK Won't Install

- **Enable Unknown Sources**: Make sure you've enabled installation from unknown sources
- **Conflicting Package**: If you have the app installed from another source, uninstall it first
- **Corrupted Download**: Re-download the APK file

### Build Takes Too Long

EAS builds are processed in a queue. Free accounts may experience longer wait times. Consider:
- Upgrading to a paid Expo plan for faster builds
- Building during off-peak hours
- Using local builds for development

## Additional Resources

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android APK vs AAB](https://docs.expo.dev/build-reference/apk/)
- [Submitting to Google Play](https://docs.expo.dev/submit/android/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
