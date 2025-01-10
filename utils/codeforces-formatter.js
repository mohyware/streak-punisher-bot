const recentSubmissionFormatter = (submissions, userId) => {
    const uniqueSubmissions = new Map();

    submissions.forEach((submission) => {
        if (submission.verdict === 'OK') {

            let division = '';
            if (submission.problem.rating >= 1900) {
                division = ' -> Div.1';
            } else if (submission.problem.rating >= 1200) {
                division = ' -> Div.2';
            } else {
                division = ' -> Div.3';
            }

            const problemId = `${submission.problem.contestId}-${submission.problem.index}${division}`;
            if (!uniqueSubmissions.has(problemId)) {
                uniqueSubmissions.set(problemId, {
                    problemId,
                    title: submission.problem.name,
                    platform: 'Codeforces',
                    submissionId: submission.id.toString(),
                    user: userId,
                    createdAt: new Date(submission.creationTimeSeconds * 1000),
                    updatedAt: new Date(submission.creationTimeSeconds * 1000),
                });
            }
        }
    });

    return Array.from(uniqueSubmissions.values());
};

const statusFormatter = (data) => {
    const submissions = data.result;
    const totalSubmissions = submissions.length;

    const acceptedProblems = new Set();

    submissions.forEach(submission => {
        if (submission.verdict === 'OK') {
            const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
            acceptedProblems.add(problemKey);
        }
    });

    const totalUniqueAccepted = acceptedProblems.size;

    return { totalSubmissions, totalUniqueAccepted };
}

module.exports = { recentSubmissionFormatter, statusFormatter };