const checkUserExistsQuery = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
    }
  }
`;

const recentSubmissionsQuery = `
  query RecentSubmissions($username: String!) {
    recentSubmissionList(username: $username, limit: 20) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

const problemDetailsQuery = `
  query ProblemDetails($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      difficulty
    }
  }
`;

const getSolvedProblemsQuery = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

module.exports = {
  checkUserExistsQuery,
  recentSubmissionsQuery,
  problemDetailsQuery,
  getSolvedProblemsQuery
};
