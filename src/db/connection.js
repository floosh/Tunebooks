/**
 * MongoDB Connection Manager
 */

const { MongoClient } = require('mongodb');

let client = null;
let db = null;

/**
 * Connect to MongoDB
 * @returns {Promise<Object>} Database connection object
 */
async function connect() {
  if (db) {
    return { client, db };
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'tunebooks';

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    db = client.db(dbName);

    console.log(`✓ Connected to MongoDB database: ${dbName}`);
    
    return { client, db };
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Get the database connection
 * @returns {Object} Database object
 */
function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return db;
}

/**
 * Get the MongoDB client
 * @returns {MongoClient} MongoDB client object
 */
function getClient() {
  if (!client) {
    throw new Error('Client not connected. Call connect() first.');
  }
  return client;
}

/**
 * Close MongoDB connection
 */
async function disconnect() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✓ Disconnected from MongoDB');
  }
}

/**
 * Check if connected to MongoDB
 * @returns {boolean} Connection status
 */
function isConnected() {
  return db !== null;
}

module.exports = {
  connect,
  disconnect,
  getDb,
  getClient,
  isConnected
};
