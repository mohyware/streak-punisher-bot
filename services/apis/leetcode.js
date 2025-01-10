require('dotenv').config();
const axios = require('axios');
const { checkUserExistsQuery, recentSubmissionsQuery, problemDetailsQuery, getSolvedProblemsQuery } = require('./leetcode-queries');

const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://leetcode.com/graphql/',
    headers: {
        'Content-Type': 'application/json',
        'Cookie': process.env.LEETCODE_COOKIE,
        'Referer': 'https://leetcode.com/',
    },
}

async function checkUserExists(username) {
    try {
        const config = {
            ...requestConfig,
            data: {
                query: checkUserExistsQuery,
                variables: { username },
            },
        }
        const response = await axios.request(config);
        const data = response.data;

        if (data.errors) {
            throw new Error(data.errors.map((err) => err.message).join(", "));
        }

        return data.data.matchedUser !== null; // Return true if user exists, false otherwise
    } catch (error) {
        throw new Error(`Error fetching user info`); // Other errors
    }
}

async function fetchUserStats(username) {
    try {
        const config = {
            ...requestConfig,
            data: {
                query: getSolvedProblemsQuery,
                variables: { username },
            },
        }
        const response = await axios.request(config);

        const data = response.data;

        if (data.errors) {
            throw new Error(data.errors.map((err) => err.message).join(", "));
        }

        const submissionStats = data.data.matchedUser?.submitStats?.acSubmissionNum;

        if (!submissionStats) {
            throw new Error("Could not retrieve solved problems for this user.");
        }

        const solvedProblems = submissionStats.map((stat) => ({
            difficulty: stat.difficulty,
            count: stat.count,
        }));

        return solvedProblems;
    } catch (error) {
        throw new Error('Error fetching user stats');
    }
}

async function fetchAllProblemStats(username) {
    try {
        // Fetch the list of recent problems
        const recentProblemSlugs = await fetchTodaySolvedProblems(username);

        // Fetch details for each problem 
        const problemStats = await Promise.all(
            recentProblemSlugs.map(async (problem) => {
                const details = await fetchProblemDetails(problem.titleSlug);
                return {
                    ...problem,
                    ...details
                };
            })
        );

        return problemStats;
    } catch (error) {
        throw new Error(`Error fetching problems stats`);
    }
}

async function fetchProblemDetails(titleSlug) {
    const config = {
        ...requestConfig,
        data: {
            query: problemDetailsQuery,
            variables: { titleSlug },
        },
    }
    try {
        const response = await axios.request(config);
        const data = response.data;
        return data.data.question;
    } catch (error) {
        throw error;
    }
}


async function fetchTodaySolvedProblems(username) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Start of the day in local time
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // End of the day in local time

    const todayStartTimestamp = Math.floor(todayStart.getTime() / 1000); // Convert to Unix time
    const todayEndTimestamp = Math.floor(todayEnd.getTime() / 1000);

    const config = {
        ...requestConfig,
        data: {
            query: recentSubmissionsQuery,
            variables: { username },
        },
    };

    try {
        const response = await axios.request(config);
        const data = response.data;

        if (data.errors) {
            throw new Error(data.errors.map((err) => err.message).join(", "));
        }

        const recentSubmissions =
            data.data?.recentSubmissionList || [];

        // Filter submissions to include only those solved today
        const todaySolvedProblems = recentSubmissions.filter((submission) => {
            const submissionTimestamp = parseInt(submission.timestamp, 10);
            return (
                submissionTimestamp >= todayStartTimestamp &&
                submissionTimestamp <= todayEndTimestamp &&
                submission.statusDisplay === "Accepted"
            );
        });

        return todaySolvedProblems.map((problem) => ({
            title: problem.title,
            titleSlug: problem.titleSlug,
            timestamp: problem.timestamp,
            lang: problem.lang,
            submissionId: problem.id
        }));
    } catch (error) {
        throw new Error("Error fetching today's solved problems.");
    }
}



module.exports = {
    fetchUserStats,
    checkUserExists,
    fetchAllProblemStats
}