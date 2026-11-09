# Assignment 7 — Simple MVC with MySQL Model (fixed)

**UAFS CSCE 20303 — Assignment 7**  
This is a complete Node.js / Express / EJS / MySQL2 project, not a simulated in-memory database project. It follows the instructor's Assignment 7 requirement to use **callbacks (not Promises)** for the MySQL2 model.

## What this app does

- `GET /` loads records from the MySQL `assignDB.users` table and renders `views/manageUsers.ejs`.
- `POST /users` validates and adds a user using an SQL `INSERT` with placeholders and then redirects to the list.
- Displays the columns `userID`, `fname`, `lname`, `username`, `passwd` from the provided schema.
- Handles SQL connection errors and duplicate usernames.

## What was causing the HTTP 500 error

`server.js` expected `getUsers(callback)` to call `callback(error, users)`, but the original `models/userDB.js` still used a simulated array and called `callback(users)`. The app therefore treated the user array as an error and never rendered the page. The actual MySQL2 model was incorrectly saved as `userDB.js` at the repository root, where the server did not import it.

**Fixed:** `models/userDB.js` now contains the MySQL2 callback-based model, the view uses the correct SQL field names, and all paths are consistent. The obsolete root file names have been retained only as forwarding/compatibility files so an upload to an existing GitHub repo does not leave conflicting old code.

## Running on the instructor's VM

**Requirements:** Node.js 18+ and a running MySQL server. Uploading source to GitHub alone does **not** host or execute a Node.js/MySQL application.

1. Open the repository on the VM or other Node.js/MySQL environment.
2. In the repository directory, install the dependencies **once**:
   ```sh
   npm install
   ```
3. If the `assignDB` database and `assignDBuser` are not already set up, initialize them **once** using the supplied SQL:
   ```sh
   sudo mysql < assignDB.sql
   ```
   **CAUTION:** Running the SQL again drops and recreates `assignDB`, deleting any new rows previously added.
4. Run the server:
   ```sh
   npm start
   ```
5. Visit `http://localhost:3000` (or the equivalent VM port-forward address).

Default DB connection settings are defined in `assignDB.sql`: `DB_HOST=localhost`, `DB_USER=assignDBuser`, `DB_PASSWORD=assignDBpass`, `DB_NAME=assignDB`. Environment variables can override these settings.

If you see a database connection error, verify the MySQL service is running and the SQL setup has been completed. Source code in GitHub cannot provision a MySQL server by itself.

## Tests

```sh
npm test
```

The automated tests exercise the SQL model and server routes using mocks, so they run without a MySQL server. GitHub Actions also executes them automatically after upload; see **Actions > Verify Assignment 7**. A real database integration test is still required to verify the instructor's particular VM setup.

## GitHub browser-only upload (no terminal needed for the student)

1. Download and **extract** the complete ZIP.
2. Open your existing Assignment 7 GitHub repository.
3. Choose **Add file > Upload files**, drag the **contents of the extracted folder** (including the `models`, `views`, and `tests` directories) into the page, then **Commit changes**.
4. **Do not upload only the ZIP file.** GitHub does not extract it into source files automatically. Do not upload the entire extracted parent folder as a new nested directory.

The original repository has tracked `node_modules` files. They are not included in this ZIP; `.gitignore` prevents newly generated dependencies from being added, but previously tracked ones may remain in the existing repository until removed separately. The existing `package-lock.json` also omits `mysql2`; an `npm install` in the VM repairs it automatically. `npm ci` against that old lockfile alone is not guaranteed to work.

## Original instructor-provided diagrams

- [MVC architecture diagram](https://github.com/UAFS-CSCE20303/assign7-simpleMVCwithModel/blob/main/mvcDesign.png)
- [User management UI diagram](https://github.com/UAFS-CSCE20303/assign7-simpleMVCwithModel/blob/main/userManage.png)

*Classroom note:* This assignment uses the provided plaintext-password column. Real applications must hash passwords and never display them.
