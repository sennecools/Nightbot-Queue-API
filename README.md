# Nightbot Queue Management API

A Google Apps Script-based API for managing a queue of users across multiple channels. This script allows Nightbot to interact with a Google Sheet to handle queue actions like joining, leaving, listing, and managing priorities. It is ideal for streamers or a group of streamers who want to manage their viewer queue efficiently.

## Features

-   **Cross-Channel Sync**: The queue is shared across multiple channels, preventing users from entering the queue in different channels to get a better position.
-   **Priority System**: The queue prioritizes users based on the following criteria:
    1. **Top Tippers** (Tip >= $6, ranked by highest tip amount)
    2. **Subscribers**, **Moderators**, and **Owners**
    3. **Users with Smaller Tips** (ranked by tip amount)
    4. **Regular Followers** (sorted by join time)
-   **Flexible Commands**: Easily manage the queue with Nightbot commands, including joining, leaving, checking position, clearing the queue, and more.
-   **Customizable Responses**: Returns JSON responses that can be parsed by Nightbot using \`$(eval)\`.

## Prerequisites

1. **Google Account**: You need a Google account to set up the Google Apps Script.
2. **Google Sheets**: Create a Google Sheet with the following columns in the first row:
    - \`Username\`
    - \`Channel\`
    - \`Timestamp\`
    - \`Priority\`
    - \`Tip Amount\`
3. **Nightbot Access**: Ensure you have Nightbot set up on your channel(s) with moderator permissions.

## Setup

### Step 1: Deploy Google Apps Script

1. Open Google Apps Script and create a new project.
2. Copy the provided script into the editor.
3. Save the project and name it (e.g., \`Nightbot Queue API\`).
4. Click on **Deploy** > **New Deployment**.
5. Choose **Web App** as the type.
6. Set **Who has access** to **Anyone**.
7. Click **Deploy**, and copy the provided URL.

### Step 2: Configure Nightbot Commands

Replace \`YOUR_ID\` in the commands below with your deployed script's URL (without any query parameters).

### Nightbot Commands

| Command         | Message                                                                                                                                                    | Userlevel |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------- | --- | ----------------------- | --------- |
| **!clearqueue** | \`!clearqueue $(eval const api=$(urlfetch json https://YOUR_ID/exec?action=clearqueue&user=$(user)&channel=$(channel)&userlevel=$(userlevel)); api.message |           | api.error      |     | "An error occurred.")\` | Moderator |
| **!join**       | \`$(eval const response=$(urlfetch json https://YOUR_ID/exec?action=join&user=$(user)&channel=$(channel)&userlevel=$(userlevel)&tip=0); response.message   |           | response.error |     | "Unexpected error.")\`  | Everyone  |
| **!leave**      | \`$(eval const response=$(urlfetch json https://YOUR_ID/exec?action=leave&user=$(user)&channel=$(channel)); response.message                               |           | response.error |     | "Unexpected error.")\`  | Everyone  |
| **!list**       | \`$(eval const response=$(urlfetch json https://YOUR_ID/exec?action=list); response.message                                                                |           | response.error |     | "Unexpected error.")\`  | Everyone  |
| **!next**       | \`$(eval const response=$(urlfetch json https://YOUR_ID/exec?action=next&userlevel=$(userlevel)); response.message                                         |           | response.error |     | "Unexpected error.")\`  | Moderator |
| **!position**   | \`$(eval const api=$(urlfetch json https://YOUR_ID/exec?action=position&user=$(user)&channel=$(channel)&userlevel=$(userlevel)); api.message               |           | api.error      |     | "An error occurred.")\` | Everyone  |
| **!queue**      | \`$(eval const api=$(urlfetch json https://YOUR_ID/exec?action=queueinfo); api.message                                                                     |           | api.error      |     | "An error occurred.")\` | Everyone  |
| **!status**     | \`$(eval const api=$(urlfetch json https://YOUR_ID/exec?action=status&user=$(user)&channel=$(channel)&userlevel=$(userlevel)); api.message                 |           | api.error      |     | "An error occurred.")\` | Everyone  |
| **!tipupdate**  | \`$(eval const response=$(urlfetch json https://YOUR_ID/exec?action=tipupdate&user=$(user)&tip=$(query)); response.message                                 |           | response.error |     | "Unexpected error.")\`  | Moderator |

## Example Google Sheet

This is an example sheet:

| Username  | Channel   | Timestamp        | Priority | Tip Amount |
| --------- | --------- | ---------------- | -------- | ---------- |
| senne1009 | senne1009 | 09/11/2024 22:32 | TRUE     | 0          |
| asdasdsa  | asdasasd  | 09/11/2024 22:32 | FALSE    | 20         |
| xzczczxc  | xzczczxc  | 09/11/2024 22:32 | FALSE    | 10         |
| hgfhgfhg  | ghghgghg  | 09/11/2024 22:32 | FALSE    | 2          |
| iouoiuio  | uiouoiuio | 09/11/2024 22:32 | FALSE    | 0          |

## Known Issues

1. **Unexpected Token Error**: Ensure that your Google Apps Script is deployed with access set to **Anyone**.
2. **Permissions Error**: Make sure Nightbot has moderator permissions in your channel.
3. **Queue Not Sorting Properly**: Ensure the correct data types are used in the Google Sheet (e.g., \`TRUE\` for subscribers, numeric values for tips).

## What still needs to change

1. Better Code Organization

    Split the code into smaller, reusable parts to make it easier to update and maintain.

2. Improved Error Handling

    Provide clearer error messages and feedback when something goes wrong.
    Use logging to help track and fix issues faster.

3. Faster Performance

    Reduce the number of times the script interacts with Google Sheets to speed things up.
    Cache data locally during execution for quicker access.

4. Concurrency Control

    Prevent multiple users from making conflicting changes to the queue at the same time using locks.

5. Flexible Sorting Options

    Allow users to customize the queue sorting (e.g., prioritize top tippers or subscribers).

6. Enhanced Data Validation

    Add checks to ensure the data added to the queue is accurate and consistent.

## Contributing

Feel free to fork this project and submit pull requests. Any contributions are welcome to improve the queue management system!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or issues, please reach out via GitHub or open an issue in this repository.
