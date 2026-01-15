/**
 * Express Application Configuration
 */

const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

module.exports = app;
