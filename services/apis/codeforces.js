require('dotenv').config();
const axios = require('axios');
const { CF_statusFormatter } = require('../../utils/codeforces-formatter')
const apiKey = process.env.CODEFORCES_KEY
const apiSecret = process.env.CODEFORCES_SECRET
const { generateApiSignature } = require('../../utils/signature-generator')

const checkUserExists = async (handle) => {
    const methodName = 'user.info';
    const params = {
        handles: handle,
        apiKey: apiKey,
    };

    const { time, apiSig } = generateApiSignature(
        methodName,
        { ...params, time: Math.floor(Date.now() / 1000) },
        apiSecret
    );

    const apiUrl = `https://codeforces.com/api/${methodName}?handles=${params.handles}&apiKey=${apiKey}&time=${time}&apiSig=${apiSig}`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.status === 'OK' && response.data.result.length > 0) {
            return true; // User exists
        }
    } catch (error) {
        if (error.response && error.response.data) {
            const { status, comment } = error.response.data;
            if (status === 'FAILED' && comment.includes('not found')) {
                return false; // User does not exist
            }
        }
        throw new Error(`Error fetching user info`); // Other errors
    }
};

const fetchRecentSubmissions = async (handle) => {
    const methodName = 'user.status';
    const params = {
        handle: handle,
        apiKey: apiKey,
    };

    const { time, apiSig } = generateApiSignature(methodName, { ...params, time: Math.floor(Date.now() / 1000) }, apiSecret);

    const apiUrl = `https://codeforces.com/api/${methodName}?handle=${params.handle}&apiKey=${apiKey}&time=${time}&apiSig=${apiSig}`;

    try {
        const response = await axios.get(apiUrl);
        const submissions = response.data.result;

        // Get the start and end timestamps for today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startTimestamp = Math.floor(startOfToday.getTime() / 1000);

        const endTimestamp = Math.floor(Date.now() / 1000);

        // Filter submissions for accepted problems solved today
        const solvedToday = submissions.filter((submission) => {
            return (
                submission.verdict === 'OK' &&
                submission.creationTimeSeconds >= startTimestamp &&
                submission.creationTimeSeconds <= endTimestamp
            );
        });

        return solvedToday;
    } catch (error) {
        throw new Error('Error fetching user submissions');
    }
};


const fetchUserStats = async (handle) => {
    const methodName = 'user.status';
    const params = {
        handle: handle,
        apiKey: apiKey,
    };
    const { time, apiSig } = generateApiSignature(methodName, { ...params, time: Math.floor(Date.now() / 1000) }, apiSecret);
    const apiUrl = `https://codeforces.com/api/${methodName}?handle=${params.handle}&apiKey=${apiKey}&time=${time}&apiSig=${apiSig}`;

    try {
        const response = await axios.get(apiUrl);
        if (response.data.status === 'FAILED') {
            throw new Error('User not found');
        }
        const stats = CF_statusFormatter(response.data);
        return stats;

    } catch (error) {
        throw new Error('Error fetching user stats');
    }
};

module.exports = {
    fetchRecentSubmissions,
    fetchUserStats,
    checkUserExists,
}