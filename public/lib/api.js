/**
 * API Client for Tunebooks Local Backend
 * Handles all communication with the local Express/MongoDB server
 */

const TunebooksAPI = (function() {
    'use strict';

    /**
     * Make an API request (relative URL)
     */
    async function request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const requestOptions = {
            ...options,
            headers,
            cache: 'no-cache'
        };

        try {
            const response = await fetch(endpoint, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `API request failed: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Get all profile names
     */
    async function getProfileNames() {
        try {
            const result = await request('/api/profiles');
            return result.data || [];
        } catch (error) {
            console.error('Error getting profile names:', error);
            return [];
        }
    }

    /**
     * Get all profiles data (legacy format for compatibility)
     * Returns: { record: { profileName: { tunes: [], sets: [] } } }
     */
    async function getAllProfiles() {
        try {
            const profileNames = await getProfileNames();
            const record = {};

            // Fetch all profiles in parallel
            const promises = profileNames.map(name => getProfile(name));
            const profiles = await Promise.all(promises);

            // Build legacy format
            profileNames.forEach((name, index) => {
                record[name] = profiles[index];
            });

            return { record };
        } catch (error) {
            console.error('Error getting all profiles:', error);
            return { record: {} };
        }
    }

    /**
     * Get a specific profile's data
     */
    async function getProfile(profileName) {
        try {
            const result = await request(`/api/profiles/${encodeURIComponent(profileName)}`);
            
            if (result.success && result.data) {
                // Return only tunes and sets (without MongoDB metadata)
                return {
                    tunes: result.data.tunes || [],
                    sets: result.data.sets || []
                };
            }
            
            return { tunes: [], sets: [] };
        } catch (error) {
            console.error(`Error getting profile ${profileName}:`, error);
            return { tunes: [], sets: [] };
        }
    }

    /**
     * Save the complete tunebooks data (all profiles)
     * Accepts legacy format: { profileName: { tunes: [], sets: [] } }
     */
    async function saveAllProfiles(record) {
        try {
            const promises = [];
            
            for (const [profileName, profileData] of Object.entries(record)) {
                promises.push(saveProfile(profileName, profileData));
            }

            await Promise.all(promises);
            
            return { success: true };
        } catch (error) {
            console.error('Error saving all profiles:', error);
            throw error;
        }
    }

    /**
     * Save a specific profile's data
     */
    async function saveProfile(profileName, profileData) {
        try {
            const result = await request(`/api/profiles/${encodeURIComponent(profileName)}`, {
                method: 'PUT',
                body: JSON.stringify({
                    tunes: profileData.tunes || [],
                    sets: profileData.sets || []
                })
            });

            return result;
        } catch (error) {
            console.error(`Error saving profile ${profileName}:`, error);
            throw error;
        }
    }

    /**
     * Delete a profile
     */
    async function deleteProfile(profileName) {
        try {
            // Delete by saving empty data
            return await saveProfile(profileName, { tunes: [], sets: [] });
        } catch (error) {
            console.error(`Error deleting profile ${profileName}:`, error);
            throw error;
        }
    }

    // Public API
    return {
        getAllProfiles,
        getProfile,
        getProfileNames,
        saveAllProfiles,
        saveProfile,
        deleteProfile
    };
})();
