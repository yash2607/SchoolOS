# Android Local Build Workflow

This repo can build Android release artifacts locally without using Expo's remote build quota.

## What this gives you

- `apk` builds for direct device installs and internal testing
- `aab` builds for Google Play submission
- no monthly Expo remote build limit

## Prerequisites

- Node.js and `pnpm`
- Android Studio with the Android SDK installed
- Java 17 available on your machine
- `ANDROID_HOME` or `ANDROID_SDK_ROOT` configured
- An Android upload keystore for release signing

Expo's local release guide is here:

- [Create a release build locally](https://docs.expo.dev/guides/local-app-production/)

## One-time signing setup

If you already created Android credentials in EAS, reuse them:

1. Run `eas credentials -p android`.
2. Download `credentials.json` from Expo.
3. Copy the keystore file into `apps/mobile/android/app/` after the first prebuild.
4. Put the signing values in your user Gradle properties file at `%USERPROFILE%\\.gradle\\gradle.properties`.

Recommended Gradle properties:

```properties
MYAPP_UPLOAD_STORE_FILE=your-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=your-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your-store-password
MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
```

Do not commit the keystore or passwords.

## Build commands

Run these from `apps/mobile`:

```bash
pnpm run android:local:apk
pnpm run android:local:aab
```

Use the clean variants if native config changed or Gradle gets stuck:

```bash
pnpm run android:local:apk:clean
pnpm run android:local:aab:clean
```

## Output files

- APK: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- AAB: `apps/mobile/android/app/build/outputs/bundle/release/app-release.aab`

## Notes

- The scripts build shared workspace packages first so `@schoolos/ui` and other monorepo packages are ready before native compilation.
- `expo prebuild` regenerates the Android native project locally. The generated `android/` folder is ignored in git.
- After you install one production build with `expo-updates`, most JS-only changes can ship with `pnpm run update:production` instead of rebuilding the app.
