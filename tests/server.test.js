const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadRoutes(model) {
    const routes = {};
    const app = {
        use() {},
        set() {},
        get(url, handler) { routes[`GET ${url}`] = handler; },
        post(url, handler) { routes[`POST ${url}`] = handler; },
        listen(port, callback) { assert.equal(port, 3000); callback(); }
    };
    function express() { return app; }
    express.urlencoded = () => () => {};

    const source = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
    vm.runInNewContext(source, {
        require(name) {
            if (name === 'express') return express;
            if (name === './models/userDB') return model;
            throw new Error(`Unexpected dependency: ${name}`);
        },
        console: { log() {}, error() {} }
    }, { filename: 'server.js' });
    return routes;
}

function response() {
    return {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        send(message) { this.message = message; return this; },
        render(view, values) { this.view = view; this.values = values; return this; },
        redirect(url) { this.location = url; return this; }
    };
}

test('GET / renders database users', () => {
    const users = [{ userID: 1, fname: 'Jane', lname: 'Smith', username: 'jsmith', passwd: 'pw' }];
    const routes = loadRoutes({ getUsers(callback) { callback(null, users); } });
    const res = response();
    routes['GET /']({}, res);
    assert.equal(res.view, 'manageUsers');
    assert.equal(res.values.users, users);
});

test('GET / reports a database error without trying to render', () => {
    const routes = loadRoutes({ getUsers(callback) { callback(new Error('unavailable')); } });
    const res = response();
    routes['GET /']({}, res);
    assert.equal(res.statusCode, 500);
    assert.match(res.message, /Unable to load users/);
    assert.equal(res.view, undefined);
});

test('POST /users inserts all fields and redirects', () => {
    let inserted;
    const routes = loadRoutes({ addUser(user, callback) { inserted = user; callback(null, { userID: 9 }); } });
    const res = response();
    routes['POST /users']({ body: { fname: ' Jane ', lname: ' Smith ', username: ' jsmith ', passwd: 'pw' } }, res);
    assert.equal(inserted.fname, 'Jane');
    assert.equal(inserted.lname, 'Smith');
    assert.equal(inserted.username, 'jsmith');
    assert.equal(inserted.passwd, 'pw');
    assert.equal(res.location, '/');
});

test('POST /users rejects missing required fields', () => {
    const routes = loadRoutes({ addUser() { assert.fail('should not call insert'); } });
    const res = response();
    routes['POST /users']({ body: { fname: 'Jane', lname: 'Smith', username: 'jsmith' } }, res);
    assert.equal(res.statusCode, 400);
});

test('POST /users reports duplicate usernames', () => {
    const routes = loadRoutes({ addUser(user, callback) { callback(Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' })); } });
    const res = response();
    routes['POST /users']({ body: { fname: 'Jane', lname: 'Smith', username: 'jsmith', passwd: 'pw' } }, res);
    assert.equal(res.statusCode, 409);
});
