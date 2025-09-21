## Streak Punisher Bot
### Overview
Streak Punisher is a Discord bot designed to help users maintain their problem-solving streaks. Each day It automatically fetches challenges from LeetCode and Codeforces, insult those who abandon their streak, ranks users based on streak, solved problems, then greet the top performer.

---
### Showcase
<img width="881" height="446" alt="Screenshot from 2025-09-21 20-50-22" src="https://github.com/user-attachments/assets/14e9bc81-1970-4af2-b6e8-1d18c2457bf4" />

---

### Features
- 🤖 **Automated Problem Fetching:** The bot automatically fetches problems from LeetCode and Codeforces.
- ✍️ **Manual Problem Addition:** For platforms not directly supported, Streak Punisher allows you to manually add problems.
- 📈 **Progress Tracking:** With MongoDB for data persistence, Streak Punisher keeps a detailed record of your solved problems, streaks, and overall progress, helping you visualize your growth over time.
- ⏰ **Daily Reminders:** Sends a message two hours before deadline to remind users who haven't solved a problem yet.

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
    # DB
    MONGO_URI=mongodb+srv://name:password@cluster0.mongodb.net/databasename
    # Server Port (8000 Koyeb deployment health check)
    PORT=8000
    # Platforms
    CODEFORCES_KEY=your-codeforces-key
    CODEFORCES_SECRET=your-codeforces-secret
    LEETCODE_COOKIE='csrftoken=your-leetcode-cookie'
    # Discord
    DISCORD_TOKEN=your-bot-token
    OWNER_ID=your-discord-id # for admin commands
    ALLOWED_CHANNEL_ID_1=
    ALLOWED_CHANNEL_ID_2=
    ALLOWED_CHANNEL_ID_3=
    # Customize msgs
    FAIL_MSG=
    TOP_MSG=
    # TimeZone
    TIMEZONE=        # example "Africa/Cairo"
    ```
4. Use one of the following commands to start the bot:
    ```bash
    npm run dev
    ```
    ```bash
    npm run start
    ```
---

### Usage
1. Invite the bot to your Discord server using the OAuth2 URL.

2. Use the commands listed above to interact with the bot.
---
### Bot Commands
#### User Commands:

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

#### Problem Commands:

- `!addproblem <problemId> <title> <platform> <submissionId (optional)>`  
  For problems that are not on Codeforces or LeetCode, add them manually.

- `!addproblems <platform>`  
  `<problem title>`

  `<problem title>`

  `<problem title>`

  add more than one quickly.

- `!deleteproblem <problemID>`  
  Deletes the specified problem from the system.

- `!setcount <count>`  
  set count for problems solved before joining the bot.
#### Statistics Commands **(Admin Only)**:

- `!dailystreak`  
  Retrieves the daily streak statistics for all users. **this ran automatically 12 PM  (local time zone)**.

- `!updatestreak`  
  Updates the daily streak for all users. **this ran automatically 12 PM  (local time zone)**.

- `!reminder`  
  remind users two hours before the deadline. **this ran automatically 10 PM  (local time zone)**.

- `!setstreak <@username> <days>`  
  Manually sets the daily streak for a specific user.
