const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom electron build process...');

// Step 1: Build Next.js app
console.log('Step 1: Building Next.js app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✓ Next.js build completed successfully');
} catch (error) {
  console.error('✗ Next.js build failed:', error.message);
  process.exit(1);
}

// Step 2: Create a temporary directory for electron-builder
console.log('Step 2: Preparing for electron-builder...');
const tempDir = path.join(__dirname, 'temp-electron-build');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Step 3: Copy necessary files to temp directory
console.log('Step 3: Copying files to temp directory...');
const filesToCopy = [
  'out',
  'public',
  'electron',
  'package.json',
  'neo-focus.ico'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    if (fs.statSync(file).isDirectory()) {
      fs.cpSync(file, path.join(tempDir, file), { recursive: true });
    } else {
      fs.copyFileSync(file, path.join(tempDir, file));
    }
  }
});

// Step 4: Copy only necessary node_modules
console.log('Step 4: Copying necessary node_modules...');
const nodeModulesDir = path.join(tempDir, 'node_modules');
fs.mkdirSync(nodeModulesDir, { recursive: true });

// Copy only essential dependencies
const essentialDeps = [
  'electron',
  'electron-squirrel-startup'
];

essentialDeps.forEach(dep => {
  const sourcePath = path.join(__dirname, 'node_modules', dep);
  const targetPath = path.join(nodeModulesDir, dep);
  if (fs.existsSync(sourcePath)) {
    fs.cpSync(sourcePath, targetPath, { recursive: true });
  }
});

// Step 5: Run electron-builder from temp directory
console.log('Step 5: Running electron-builder...');
process.chdir(tempDir);

try {
  execSync('npx electron-builder --windows', { stdio: 'inherit' });
  console.log('✓ Electron build completed successfully');
} catch (error) {
  console.error('✗ Electron build failed:', error.message);
  process.exit(1);
}

// Step 6: Copy results back to main directory
console.log('Step 6: Copying build results...');
const distSource = path.join(tempDir, 'dist');
const distTarget = path.join(__dirname, 'dist');

if (fs.existsSync(distSource)) {
  if (fs.existsSync(distTarget)) {
    fs.rmSync(distTarget, { recursive: true, force: true });
  }
  fs.cpSync(distSource, distTarget, { recursive: true });
}

// Step 7: Cleanup
console.log('Step 7: Cleaning up...');
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('✓ Build process completed successfully!');
console.log('📦 Your executable is ready in the dist/ directory');
