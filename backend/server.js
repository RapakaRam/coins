require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const coinRoutes = require('./routes/coinRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for Base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/coins', coinRoutes);

// Try to find and serve React frontend static files
let frontendBuildPath = path.join(__dirname, '../frontend/build');

// If frontend build doesn't exist in expected location, check alternate paths
if (!fs.existsSync(frontendBuildPath)) {
  console.log(`Frontend build not found at ${frontendBuildPath}`);
  console.log('Checking alternate paths...');
  
  // Try alternate path for Render
  const alternatePath = path.join(__dirname, '../../../frontend/build');
  if (fs.existsSync(alternatePath)) {
    console.log(`Found frontend build at ${alternatePath}`);
    frontendBuildPath = alternatePath;
  } else {
    console.warn('⚠️  Frontend build not found - API only mode');
    console.warn('Available paths checked:');
    console.warn(`  - ${frontendBuildPath}`);
    console.warn(`  - ${alternatePath}`);
  }
}

// Serve React frontend static files if available
if (fs.existsSync(frontendBuildPath)) {
  console.log(`✓ Serving frontend from: ${frontendBuildPath}`);
  app.use(express.static(frontendBuildPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend not configured' });
    }
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

