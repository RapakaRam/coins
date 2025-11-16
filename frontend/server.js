const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Determine build path - works from both frontend/ and root directory
const buildPath = path.join(__dirname, 'build');

// Check if build directory exists
if (!fs.existsSync(buildPath)) {
  console.error(`ERROR: Build directory not found at ${buildPath}`);
  console.error(`Current directory: ${__dirname}`);
  console.error(`Contents of current directory:`, fs.readdirSync(__dirname));
  process.exit(1);
}

console.log(`✓ Build directory found at: ${buildPath}`);
console.log(`✓ Contents:`, fs.readdirSync(buildPath));

// Serve static files from the build directory with caching
app.use(express.static(buildPath, { 
  maxAge: '1h',
  etag: false 
}));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  
  // Check if index.html exists
  if (!fs.existsSync(indexPath)) {
    console.error(`ERROR: index.html not found at ${indexPath}`);
    return res.status(500).send('Server configuration error: index.html not found');
  }
  
  console.log(`✓ Serving index.html for ${req.method} ${req.path}`);
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✓ Server started successfully on port ${PORT}\n`);
});
