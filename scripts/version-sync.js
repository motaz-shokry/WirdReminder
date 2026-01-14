const fs = require('fs');
const path = require('path');

const rootPackagePath = path.join(__dirname, '..', 'package.json');
const chromeManifestPath = path.join(__dirname, '..', 'chrome', 'manifest.json');
const firefoxManifestPath = path.join(__dirname, '..', 'firefox', 'manifest.json');
const wwwManifestPath = path.join(__dirname, '..', 'www', 'manifest.json');
const androidGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const version = rootPackage.version;

function updateManifest(filePath) {
    if (fs.existsSync(filePath)) {
        const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        manifest.version = version;
        fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2) + '\n');
        console.log(`✅ Updated ${path.relative(path.join(__dirname, '..'), filePath)} to v${version}`);
    }
}

function updateAndroidVersion(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Update versionName "x.x"
        content = content.replace(/versionName\s+".*?"/g, `versionName "${version}"`);

        // Auto-increment versionCode if it's a new version
        // This is a simple logic, might need adjustment for more complex use cases
        // For now, just ensure it matches package.json version

        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${path.relative(path.join(__dirname, '..'), filePath)} to v${version}`);
    }
}

updateManifest(chromeManifestPath);
updateManifest(firefoxManifestPath);
updateManifest(wwwManifestPath);
updateAndroidVersion(androidGradlePath);
