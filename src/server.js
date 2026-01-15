/**
 * Tunebooks Server Entry Point
 * Starts the Express server
 */

require('dotenv').config();
const app = require('./app');
const { connect, disconnect } = require('./db/connection');

const PORT = process.env.PORT || 8080;

/**
 * Start server with MongoDB connection
 */
async function startServer() {
  try {
    // Connect to MongoDB
    await connect();

    // Start Express server
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

    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer().then(server => {
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    await disconnect();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
