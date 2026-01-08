#!/bin/bash

# Build script for Wird Reminder browser extension
# Generates zip files for Chrome and Firefox with version numbers

set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

# Extract version from Chrome manifest (both should have the same version)
VERSION=$(grep -o '"version": *"[^"]*"' "$SCRIPT_DIR/chrome/manifest.json" | head -1 | cut -d'"' -f4)

if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from manifest.json"
    exit 1
fi

echo "Building Wird Reminder v$VERSION"
echo "================================"

# Create build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Build Chrome extension
CHROME_ZIP="$BUILD_DIR/wird-reminder-chrome-v$VERSION.zip"
echo "Building Chrome extension..."
rm -f "$CHROME_ZIP"
cd "$SCRIPT_DIR/chrome"
zip -r "$CHROME_ZIP" manifest.json src -x "*.DS_Store" -x "*__MACOSX*"
echo "✓ Chrome extension: $CHROME_ZIP"

# Build Firefox extension
FIREFOX_ZIP="$BUILD_DIR/wird-reminder-firefox-v$VERSION.zip"
echo "Building Firefox extension..."
rm -f "$FIREFOX_ZIP"
cd "$SCRIPT_DIR/firefox"
zip -r "$FIREFOX_ZIP" manifest.json src -x "*.DS_Store" -x "*__MACOSX*"
echo "✓ Firefox extension: $FIREFOX_ZIP"

echo ""
echo "Build complete!"
echo "==============="
echo "Chrome:  $CHROME_ZIP"
echo "Firefox: $FIREFOX_ZIP"
