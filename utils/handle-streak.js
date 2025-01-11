async function handleStreak(user) {
    const STREAK_INTERVAL = 24 * 60 * 60 * 1000;
    const now = new Date();

    if (!user.lastSubmissionDate) {
        user.streak = 1;
    } else {
        const lastSubmissionDate = new Date(user.lastSubmissionDate);
        const sameDay =
            now.getUTCFullYear() === lastSubmissionDate.getUTCFullYear() &&
            now.getUTCMonth() === lastSubmissionDate.getUTCMonth() &&
            now.getUTCDate() === lastSubmissionDate.getUTCDate();

        if (sameDay) {
            return user.streak; // No changes to the streak
        }

        const timeSinceLastSubmission = now - lastSubmissionDate;

        if (timeSinceLastSubmission < STREAK_INTERVAL) {
            // Within 24 hours, increment streak
            user.streak += 1;
        } else if (timeSinceLastSubmission < 2 * STREAK_INTERVAL) {
            // Slightly outside the interval, reset to 1 (recovery streak)
            user.streak = 1;
        } else {
            // Too long ago, reset streak entirely
            user.streak = 0;
        }
    }
    await user.save();
    return user.streak;
}

module.exports = handleStreak;