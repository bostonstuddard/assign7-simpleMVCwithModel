const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadModel(queryHandler) {
    let poolConfig;
    const code = fs.readFileSync(path.join(__dirname, '../models/userDB.js'), 'utf8');
    const module = { exports: {} };
    const context = {
        module,
        exports: module.exports,
        process: { env: {} },
        require(name) {
            assert.equal(name, 'mysql2');
            return {
                createPool(config) {
                    poolConfig = config;
                    return { query: queryHandler };
                }
            };
        }
    };
    vm.runInNewContext(code, context, { filename: 'models/userDB.js' });
    return { db: module.exports, poolConfig };
}

test('connects using the database settings from assignDB.sql', () => {
    const { poolConfig } = loadModel(() => {});
    assert.equal(poolConfig.host, 'localhost');
    assert.equal(poolConfig.user, 'assignDBuser');
    assert.equal(poolConfig.password, 'assignDBpass');
    assert.equal(poolConfig.database, 'assignDB');
});

test('getUsers retrieves all database columns through a callback', () => {
    const rows = [{ userID: 1, fname: 'John', lname: 'Doe', username: 'jdoe', passwd: 'test' }];
    const { db } = loadModel((sql, cb) => {
        assert.match(sql, /^SELECT userID, fname, lname, username, passwd FROM users/);
        cb(null, rows);
    });
    db.getUsers((error, result) => {
        assert.equal(error, null);
        assert.equal(result, rows);
    });
});

test('getUsers passes database errors to the route callback', () => {
    const problem = new Error('Connection refused');
    const { db } = loadModel((sql, cb) => cb(problem));
    db.getUsers((error) => assert.equal(error, problem));
});

test('addUser uses SQL placeholders and returns inserted userID', () => {
    const user = { fname: 'A', lname: 'B', username: "ab' OR 1=1 --", passwd: 'pass' };
    const { db } = loadModel((sql, values, cb) => {
        assert.match(sql, /^INSERT INTO users \(fname, lname, username, passwd\) VALUES \(\?, \?, \?, \?\)$/);
        assert.equal(values[2], user.username);
        assert.equal(values.length, 4);
        cb(null, { insertId: 21 });
    });
    db.addUser(user, (error, result) => {
        assert.equal(error, null);
        assert.equal(result.userID, 21);
        assert.equal(result.username, user.username);
    });
});

test('addUser passes insertion errors to the route callback', () => {
    const problem = Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' });
    const { db } = loadModel((sql, values, cb) => cb(problem));
    db.addUser({ fname: 'A', lname: 'B', username: 'ab', passwd: 'pw' }, (error) => {
        assert.equal(error, problem);
    });
});
