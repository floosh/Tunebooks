/**
 * Tunebook Model
 * Database operations for tunebooks collection
 */

const { getDb } = require('../db/connection');

const COLLECTION_NAME = 'tunebooks';

/**
 * Get all profile names
 * @returns {Promise<Array<string>>} Array of profile names
 */
async function getProfileNames() {
  const db = getDb();
  const profiles = await db.collection(COLLECTION_NAME)
    .find({}, { projection: { profileName: 1, _id: 0 } })
    .sort({ profileName: 1 })
    .toArray();
  
  return profiles.map(p => p.profileName);
}

/**
 * Get a profile by name
 * @param {string} profileName - Profile name to retrieve
 * @returns {Promise<Object|null>} Profile document or null if not found
 */
async function getProfile(profileName) {
  const db = getDb();
  const profile = await db.collection(COLLECTION_NAME)
    .findOne({ profileName });
  
  return profile;
}

/**
 * Update (replace) a profile
 * @param {string} profileName - Profile name to update
 * @param {Object} profileData - New profile data { tunes: [], sets: [] }
 * @returns {Promise<Object>} Update result
 */
async function updateProfile(profileName, profileData) {
  const db = getDb();
  
  const now = new Date();
  const document = {
    profileName,
    tunes: profileData.tunes || [],
    sets: profileData.sets || [],
    updatedAt: now
  };

  const result = await db.collection(COLLECTION_NAME)
    .updateOne(
      { profileName },
      { 
        $set: document,
        $setOnInsert: { createdAt: now }
      },
      { upsert: true }
    );

  return {
    success: true,
    upserted: result.upsertedCount > 0,
    modified: result.modifiedCount > 0,
    profileName
  };
}

module.exports = {
  getProfileNames,
  getProfile,
  updateProfile
};
