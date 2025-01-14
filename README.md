## Streak Punisher Bot
### Overview
Streak Punisher is a Discord bot designed to help users maintain their problem-solving streaks. It automatically fetches problems from LeetCode and Codeforces, while also offering the option to manually add problems from other platforms.

### Features
- **Automated Problem Fetching:** The bot automatically fetches problems from LeetCode and Codeforces.
- **Manual Problem Addition:** For platforms not directly supported, Streak Punisher allows you to manually add problems, ensuring you can keep your streak alive no matter where you practice.
- **Progress Tracking:** With MongoDB for data persistence, Streak Punisher keeps a detailed record of your solved problems, streaks, and overall progress, helping you visualize your growth over time.

### User Commands:

- `!join <username> <leetcode_username (optional)> <codeforces_username (optional)>`  
  Adds a new user to the system.

- `!getuser <name|codeforces_username|leetcode_username>`  
  Retrieves the details of the specified user.

- `rename <name> <new_leetcode_username> <new_codeforces_username>`  
  Updates the leetcode or codeforces username of an existing user.

- `!escape <username>`  
  Removes the specified user from the system.

**Example:**  
`!join mohy null mohyware`  
Adds a user with only a Codeforces username.

### Problem Commands:

- `!addproblem <problemId> <title> <platform> <submissionId (optional)>`  
  For problems that are not on Codeforces or LeetCode, add them manually.

- `!deleteproblem <problemID>`  
  Deletes the specified problem from the system.

### Statistics Commands (Admin Only):

- `!dailystreak`  
  Retrieves the daily streak statistics for all users.

- `!updatestreak`  
  Updates the daily streak for all users.

- `!setstreak <@username> <days>`  
  Manually sets the daily streak for a specific user.

---

### Prerequisites

Ensure you have the following:

- **Node.js** (v16 or later recommended)
- **MongoDB** instance (local or cloud-hosted)
- **Discord Bot Token** (obtained from the [Discord Developer Portal](https://discord.com/developers/applications))

---

### Installation

1. Clone the repository:  
   ```bash
   git clone https://github.com/mohyware/streak-punisher-bot.git
   cd streak-punisher-bot
2. Install dependencies:
    ```bash
    npm install
    ```
3. Rename .env.example to .env and add your configurations:
    ```bash
    DISCORD_TOKEN=your-bot-token
    MONGO_URI=mongodb+srv://name:password@cluster0.mongodb.net/databasename
    PORT=3000
    SERVER_ID=your-server-id
    CODEFORCES_KEY=your-codeforces-key
    CODEFORCES_SECRET=your-codeforces-secret
    LEETCODE_COOKIE=csrftoken=your-leetcode-cookie
    OWNER_ID=your-discord-id
    ```
---

### Usage
1. Invite the bot to your Discord server using the OAuth2 URL.

2. Use the commands listed above to interact with the bot.
---

### Contributing
Feel free to fork the repository and submit pull requests.