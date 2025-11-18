// Post-build script to patch standalone server.js
// Automatically runs after: npm run build
// Forces server to listen on Railway's PORT and 0.0.0.0

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (!fs.existsSync(serverPath)) {
  console.error('❌ Standalone server not found. Run: npm run build');
  process.exit(1);
}

console.log('🔧 Patching standalone server.js...');

let serverCode = fs.readFileSync(serverPath, 'utf8');
let modified = false;

// Pattern 1: server.listen(port) or server.listen(port, callback)
serverCode = serverCode.replace(/(server|app|httpServer|http)\.listen\(([^)]+)\)/g, (match, serverVar, args) => {
  // Skip if already has 0.0.0.0
  if (match.includes('0.0.0.0')) {
    return match;
  }
  
  modified = true;
  // Replace with PORT and 0.0.0.0
  return `${serverVar}.listen(parseInt(process.env.PORT || '8080', 10), '0.0.0.0')`;
});

// Pattern 2: .listen(port) or .listen(port, host) or .listen(port, callback)
serverCode = serverCode.replace(/\.listen\(\s*(\d+|\w+)\s*(?:,\s*['"]?[^)]+['"]?)?\s*\)/g, (match, portArg) => {
  // Skip if already has 0.0.0.0
  if (match.includes('0.0.0.0')) {
    return match;
  }
  
  // Skip if it's not a number (might be a variable we shouldn't touch)
  if (isNaN(parseInt(portArg))) {
    return match;
  }
  
  modified = true;
  return `.listen(parseInt(process.env.PORT || '8080', 10), '0.0.0.0')`;
});

if (modified) {
  fs.writeFileSync(serverPath, serverCode);
  console.log('✅ Patched standalone server.js to use PORT and 0.0.0.0');
  console.log('   Server will now listen on: 0.0.0.0:$PORT');
} else {
  console.log('ℹ️  No changes needed (server already configured correctly)');
}

