
const leetcodeFormatter = (submissions, userId) => {
    const uniqueSubmissions = new Map();

    submissions.forEach((submission) => {
        if (submission.questionFrontendId && submission.questionFrontendId.trim()) {
            const problemId = `LeetCode-${submission.questionFrontendId}`;
            if (!uniqueSubmissions.has(problemId)) {
                uniqueSubmissions.set(problemId, {
                    problemId,
                    title: submission.title,
                    platform: 'LeetCode',
                    submissionId: submission.submissionId.toString(),
                    user: userId,
                    createdAt: new Date(parseInt(submission.timestamp) * 1000), // Convert Unix timestamp
                    updatedAt: new Date(parseInt(submission.timestamp) * 1000),
                });
            }
        }
    });

    return Array.from(uniqueSubmissions.values());
};
module.exports = { leetcodeFormatter };