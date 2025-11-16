const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const buildPath = path.join(__dirname, 'build');

// Check if build directory exists
if (!fs.existsSync(buildPath)) {
  console.error(`Build directory not found at ${buildPath}`);
  process.exit(1);
}

console.log(`Serving files from: ${buildPath}`);

// Serve static files from the build directory
app.use(express.static(buildPath));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  console.log(`Serving index.html for route: ${req.path}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`Error serving file: ${err}`);
      res.status(500).send('Server error');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Build directory: ${buildPath}`);
});
