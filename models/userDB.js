const mysql = require('mysql2');

// Values from assignDB.sql; environment variables allow VM overrides.
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'assignDBuser',
    password: process.env.DB_PASSWORD || 'assignDBpass',
    database: process.env.DB_NAME || 'assignDB'
});

// MySQL2 callback-based SELECT (no Promises).
function getUsers(callback) {
    const sql = 'SELECT userID, fname, lname, username, passwd FROM users ORDER BY userID';
    db.query(sql, function (error, rows) {
        callback(error, rows);
    });
}

// Parameterized INSERT prevents SQL injection through form fields.
function addUser(user, callback) {
    const sql = 'INSERT INTO users (fname, lname, username, passwd) VALUES (?, ?, ?, ?)';
    const values = [user.fname, user.lname, user.username, user.passwd];
    db.query(sql, values, function (error, result) {
        if (error) return callback(error);
        callback(null, {
            userID: result.insertId,
            fname: user.fname,
            lname: user.lname,
            username: user.username,
            passwd: user.passwd
        });
    });
}

module.exports = { getUsers, addUser };
