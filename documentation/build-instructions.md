# Build & Deployment Instructions

This project uses **NPM** as the central command hub to manage versions, synchronize code across platforms, and build distribution packages.

## 📋 Prerequisites
- **Node.js** (v18 or higher recommended)
- **NPM**
- **Zip** (for extension packaging)
- **Android Studio** (for mobile builds)

## 🛠️ Development Workflow

### 1. The Core Principle
All shared logic, styles, and assets reside in the `/core` directory. **NEVER** edit files inside `chrome/src/core`, `firefox/src/core`, or `www/core` directly, as they will be overwritten during synchronization.

### 2. Synchronizing Changes
After making changes to the `/core` directory, run the sync command to propagate them to all platform shells:
```bash
npm run sync
```

### 3. Version Management
We use a "Single Source of Truth" for versioning. Always update the version in the root `package.json`:
```bash
# Example: Bumping to a new patch version
npm version patch
```
This will automatically:
1. Update `package.json`.
2. Sync the new version to `chrome/manifest.json`, `firefox/manifest.json`, and `www/manifest.json`.

---

## 📦 Building for Distribution

### Unified Build
To run the full pipeline (Sync ➔ Extensions ➔ Android APK):
```bash
npm run build
```
The output directory `/build` will contain:
1. `wird-reminder-chrome-v1.1.0.zip`
2. `wird-reminder-firefox-v1.1.0.zip`
3. `wird-reminder-v1.1.0.apk` (Android Debug Build)

### Requirements for Android Build
The Android build uses the local Gradle wrapper. 
- **Recommended Java Version**: **Java 17** or **Java 21** (LTS).
- **Incompatibility Note**: If you see an error like `Unsupported class file major version 69`, it means your system is using **Java 25**, which is too new for the current Gradle version (8.14.3).

#### How to fix Java version issues:
1. Install Java 17 or 21.
2. Set your `JAVA_HOME` environment variable to point to the correct version before running the build.
3. On Linux (Arch), you can use `sudo archlinux-java set java-17-openjdk`.

---

## 📂 Project Structure
- **/core**: Master logic, adapters, styles, and assets.
- **/www**: Web/PWA shell (Source for Capacitor).
- **/chrome**: Chrome extension manifest and specific background scripts.
- **/firefox**: Firefox extension manifest and specific background scripts.
- **/android**: Native Android project files.
- **/scripts**: Automation and build scripts.
- **/documentation**: Architectural guides and handover logs.
