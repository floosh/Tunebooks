/**
 * API Client for Tunebooks MongoDB Backend
 * Handles all communication with the Tunebooks_Server REST API
 */

const TunebooksAPI = (function() {
    'use strict';

    // Configuration - read dynamically from window.TUNEBOOKS_CONFIG
    function getConfig() {
        return {
            baseURL: window.TUNEBOOKS_CONFIG?.apiBaseURL || 'http://localhost:3000',
            apiKey: window.TUNEBOOKS_CONFIG?.apiKey || '',
            collection: 'tunebooks'
        };
    }

    /**
     * Make an authenticated API request
     */
    async function request(endpoint, options = {}) {
        const config = getConfig();
        const url = `${config.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-API-Key': config.apiKey,
            ...options.headers
        };

        const requestOptions = {
            ...options,
            headers,
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'omit',
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        };

        try {
            const response = await fetch(url, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `API request failed: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    /**
     * Get all profile data from MongoDB
     * Returns the complete tunebooks record with all profiles
     */
    async function getAllProfiles() {
        try {
            const config = getConfig();
            const result = await request('/api/data/get?' + new URLSearchParams({
                collection: config.collection,
                limit: '1'
            }));

            if (result.success && result.data && result.data.length > 0) {
                // Return the first (and only) document
                return result.data[0];
            } else {
                // No data found, return empty structure
                return { _id: null, record: {} };
            }
        } catch (error) {
            console.error('Error getting profiles:', error);
            throw error;
        }
    }

    /**
     * Get a specific profile's data
     */
    async function getProfile(profileName) {
        const allData = await getAllProfiles();
        return allData.record[profileName] || { tunes: [], sets: [] };
    }

    /**
     * Save the complete tunebooks data (all profiles)
     */
    async function saveAllProfiles(record) {
        try {
            const config = getConfig();
            const existingData = await getAllProfiles();
            
            const dataToSave = {
                record: record
            };

            let result;
            if (existingData._id) {
                // Update existing document
                result = await request('/api/data/update', {
                    method: 'PUT',
                    body: JSON.stringify({
                        collection: config.collection,
                        filter: { _id: existingData._id },
                        update: dataToSave
                    })
                });
            } else {
                // Insert new document
                result = await request('/api/data/insert', {
                    method: 'POST',
                    body: JSON.stringify({
                        collection: config.collection,
                        data: dataToSave
                    })
                });
            }

            return result;
        } catch (error) {
            console.error('Error saving profiles:', error);
            throw error;
        }
    }

    /**
     * Save a specific profile's data
     */
    async function saveProfile(profileName, profileData) {
        const allData = await getAllProfiles();
        allData.record[profileName] = profileData;
        return await saveAllProfiles(allData.record);
    }

    /**
     * Delete a profile
     */
    async function deleteProfile(profileName) {
        const allData = await getAllProfiles();
        delete allData.record[profileName];
        return await saveAllProfiles(allData.record);
    }

    /**
     * Initialize the API with custom configuration
     * This is now deprecated as config is read dynamically from window.TUNEBOOKS_CONFIG
     */
    function init(customConfig = {}) {
        console.warn('TunebooksAPI.init() is deprecated. Set window.TUNEBOOKS_CONFIG before loading api.js instead.');
        if (customConfig.apiBaseURL) window.TUNEBOOKS_CONFIG.apiBaseURL = customConfig.apiBaseURL;
        if (customConfig.apiKey) window.TUNEBOOKS_CONFIG.apiKey = customConfig.apiKey;
    }

    /**
     * Get current configuration (for debugging)
     */
    function getConfigDebug() {
        const config = getConfig();
        return {
            baseURL: config.baseURL,
            apiKey: config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'NOT SET',
            collection: config.collection
        };
    }

    // Public API
    return {
        init,
        getConfig: getConfigDebug,
        getAllProfiles,
        getProfile,
        saveAllProfiles,
        saveProfile,
        deleteProfile
    };
})();
