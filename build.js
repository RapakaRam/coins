#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Coin Collector...\n');

// Build backend
console.log('📦 Installing backend dependencies...');
execSync('cd backend && npm install', { stdio: 'inherit' });

// Build frontend
console.log('\n📦 Installing frontend dependencies...');
execSync('cd frontend && npm install', { stdio: 'inherit' });

console.log('\n🏗️  Building frontend...');
execSync('cd frontend && npm run build', { stdio: 'inherit' });

console.log('\n✅ Build completed successfully!\n');
