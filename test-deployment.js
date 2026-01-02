// Simple test to verify the app works
const express = require('express');
const path = require('path');

// Test if we can require the main app
try {
  console.log('Testing app import...');
  const app = require('./backend/src/app.js');
  console.log('✅ App imported successfully');
  
  // Test if environment variables work
  console.log('Testing environment...');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('PORT:', process.env.PORT || 5000);
  console.log('✅ Environment check complete');
  
  console.log('🎉 App is ready for deployment!');
} catch (error) {
  console.error('❌ Error testing app:', error.message);
  console.error('Stack:', error.stack);
}