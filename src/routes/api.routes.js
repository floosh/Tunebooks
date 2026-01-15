/**
 * API Routes
 * RESTful endpoints for tunebooks
 */

const express = require('express');
const router = express.Router();
const tunebookModel = require('../models/tunebook.model');

/**
 * GET /api/profiles
 * Get all profile names
 */
router.get('/profiles', async (req, res) => {
  try {
    const profileNames = await tunebookModel.getProfileNames();
    res.json({
      success: true,
      data: profileNames
    });
  } catch (error) {
    console.error('Error fetching profile names:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile names'
    });
  }
});

/**
 * GET /api/profiles/:profileName
 * Get a specific profile
 */
router.get('/profiles/:profileName', async (req, res) => {
  try {
    const { profileName } = req.params;
    const profile = await tunebookModel.getProfile(profileName);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

/**
 * PUT /api/profiles/:profileName
 * Update (replace) a profile
 */
router.put('/profiles/:profileName', async (req, res) => {
  try {
    const { profileName } = req.params;
    const profileData = req.body;

    // Validate request body
    if (!profileData || typeof profileData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid profile data'
      });
    }

    const result = await tunebookModel.updateProfile(profileName, profileData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

module.exports = router;
