/**
 * Tunebooks Server Entry Point
 * Starts the Express server
 */

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 8080;

// Start server
const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log('  Tunebooks Server');
  console.log('========================================');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
