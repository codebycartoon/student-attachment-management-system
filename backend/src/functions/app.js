const serverless = require('serverless-http');
const app = require('../app');

// Export the serverless function
exports.handler = serverless(app);