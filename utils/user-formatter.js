const formatUserData = (user, problemCount) => {
    const fields = [
        { label: '👤 User', value: user.name },
        { label: '💻 LeetCode Username', value: user.leetcode_username },
        { label: '📈 Codeforces Username', value: user.codeforces_username },
        //{ label: '✅ LeetCode AC', value: user.leetcode_acSubmissions, condition: user.leetcode_acSubmissions > 0 },
        //{ label: '🏆 Codeforces AC', value: user.codeforces_acSubmissions, condition: user.codeforces_acSubmissions > 0 },
        //{ label: '🌟 Other AC', value: problemCount, condition: problemCount > 0 },
        //{ label: '🔥 Streak', value: user.streak },
        { label: '🎯 Total AC', value: problemCount, condition: problemCount > 0 },
        { label: '📅 Last Submission Date', value: user.lastSubmissionDate ? user.lastSubmissionDate.toLocaleDateString() : null }
    ];

    return fields
        .filter(({ value, condition }) => value !== null && (condition === undefined || condition)) // Include only valid fields
        .map(({ label, value }) => `${label}: ${value}`)
        .join('\n');
};

const formatProblems = (stats) => {
    const statsFormatted = stats.todaySolved.map((item, index) => {
        return `🔹 **Problem #${index + 1}:** ${item.title}  🆔${item.problemId}   🌐 **Platform:** ${item.platform}  📅 ${new Date(item.createdAt).toLocaleTimeString()}\n`;

    }).join('');
    return statsFormatted;
}
module.exports = { formatUserData, formatProblems };