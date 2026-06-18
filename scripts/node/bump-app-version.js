const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = require(packageJsonPath);

const versionFlag = process.argv[2]; // --major, --minor, or undefined for patch

let [major, minor, patch] = packageJson.version.split('.').map(Number);

if (versionFlag === '--major') {
  major++;
  minor = 0;
  patch = 0;
} else if (versionFlag === '--minor') {
  minor++;
  patch = 0;
} else {
  patch++;
}

const newVersion = `${major}.${minor}.${patch}`;
packageJson.version = newVersion;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`✅ Version bumped to ${newVersion}`);