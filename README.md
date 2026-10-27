## Assignment 7: Simple Model-View-Controller Database Backend Modification

This application uses Express, EJS, and a MySQL database. The MVC model in `models/userDB.js` uses **MySQL2 callbacks (not Promises)** to retrieve users and insert new ones. The view displays all five columns in the supplied `users` table: `userID`, `fname`, `lname`, `username`, and `passwd`.

### Set up on your VM

1. Clone this repository and change to the project directory.
2. Install Node.js dependencies (including MySQL2):
   ```bash
   npm install
   ```
3. Install/start MySQL if needed. Create and populate the assignment database **once**:
   ```bash
   sudo mysql < assignDB.sql
   ```
   **Warning:** the SQL file drops and recreates the `assignDB` database and user. Running it again deletes any users you added.
4. Start the server:
   ```bash
   npm start
   ```
5. Visit `http://localhost:3000` (or forward port 3000 from the VM).

By default the app uses the credentials supplied in `assignDB.sql`: MySQL user `assignDBuser`, password `assignDBpass`, database `assignDB`, and host `localhost`. You can override these with the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` environment variables.

### Assignment changes

- Added the `mysql2` dependency.
- Replaced the simulated JavaScript users array with callback-based `SELECT` and parameterized `INSERT` queries in `models/userDB.js`.
- Updated the Express routes to handle database errors and required fields.
- Updated `views/manageUsers.ejs` to display every database column, use `userID`, and collect the required password when adding a user.
- Fixed the malformed comment before the sample INSERT statements in `assignDB.sql`.

Run `npm test` for model unit tests (no MySQL server is required for the unit tests). The full application requires a running MySQL database.

**Note:** This exercise follows the supplied schema, which stores sample passwords in plaintext and displays the password column. Real applications must hash passwords and never display them.

### Original assignment diagrams

![MVC Diagram](https://raw.githubusercontent.com/bostonstuddard/assign7-simpleMVCwithModel/main/mvcDesign.png)

![User Management](https://raw.githubusercontent.com/bostonstuddard/assign7-simpleMVCwithModel/main/userManage.png)
