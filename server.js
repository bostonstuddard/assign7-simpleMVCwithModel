const express = require('express');
const userDB = require('./models/userDB');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// Routes
app.get('/', function (req, res) {
    userDB.getUsers(function (error, users) {
        if (error) {
            console.error('Unable to retrieve users:', error);
            return res.status(500).send('Unable to load users from the database.');
        }
        res.render('manageUsers', { users: users });
    });
});

app.post('/users', function (req, res) {
    const user = {
        fname: (req.body.fname || '').trim(),
        lname: (req.body.lname || '').trim(),
        username: (req.body.username || '').trim(),
        passwd: req.body.passwd || ''
    };
    if (!user.fname || !user.lname || !user.username || !user.passwd) {
        return res.status(400).send('All fields are required.');
    }
    userDB.addUser(user, function (error) {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('That username already exists.');
            }
            console.error('Unable to add user:', error);
            return res.status(500).send('Unable to save the user to the database.');
        }
        res.redirect('/');
    });
});

app.listen(PORT, function () {
    console.log(`Listening on Port: ${PORT}`);
});
