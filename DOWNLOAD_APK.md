# 📱 How to Download the Android APK

## Quick Start

### Download Pre-built APK

1. Go to the [**Releases**](../../releases) page
2. Download the latest `.apk` file
3. Install on your Android device

### Build Your Own APK

```bash
# Install EAS CLI
bun install -g @expo/eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

For detailed instructions, see [BUILDING_APK.md](./BUILDING_APK.md)

## Need Help?

- **Setup Issues**: See [BUILDING_APK.md](./BUILDING_APK.md#troubleshooting)
- **Installation Problems**: Make sure "Unknown sources" is enabled on your Android device
- **Build Questions**: Check the [Expo Documentation](https://docs.expo.dev/build/introduction/)
