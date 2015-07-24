'use strict';

var http = require('http');
var static_ = require('..');
var request = require('supertest');
var tianma = require('tianma');
var path = require('path');

var FIXTURES_DIR = path.join(__dirname, 'fixtures');

function createApp() {
    var app = tianma();
    var server = http.createServer(app.run);

    app.server = server;

    return app;
}

describe('static({ root: root })', function () {
    function createServer() {
        var app = createApp();

        app.use(static_({ root: FIXTURES_DIR }));

        return app.server;
    }

    it ('should support access a file', function (done) {
        request(createServer())
            .get('/index.html')
            .expect(200)
            .expect('content-type', 'text/html')
            .expect('last-modified', /GMT/)
            .expect('<!DOCTYPE html>\n')
            .end(done);
    });

    it ('should support access a directory', function (done) {
        request(createServer())
            .get('/css/')
            .expect(200)
            .expect('content-type', 'text/html')
            .expect('last-modified', /GMT/)
            .expect(/a\.css<\/a>/)
            .end(done);
    });

    it ('should return 404 while missing something', function (done) {
        request(createServer())
            .get('/assets/b.css')
            .expect(404)
            .end(done);
    });
});

describe('static({ root: root, indexes: arr })', function () {
    function createServer() {
        var app = createApp();

        app.use(static_({
            root: FIXTURES_DIR,
            indexes: [ 'index.html', 'a.css' ]
        }));

        return app.server;
    }

    it ('should use the 1st default index', function (done) {
        request(createServer())
            .get('/')
            .expect(200)
            .expect('content-type', 'text/html')
            .expect('last-modified', /GMT/)
            .expect('<!DOCTYPE html>\n')
            .end(done);
    });

    it ('should use the 2nd default index', function (done) {
        request(createServer())
            .get('/css/')
            .expect(200)
            .expect('content-type', 'text/css')
            .expect('last-modified', /GMT/)
            .expect('.a {}\n')
            .end(done);
    });

    it ('should fall back to auto index when no default index found', function (done) {
        request(createServer())
            .get('/js/')
            .expect(200)
            .expect('content-type', 'text/html')
            .expect('last-modified', /GMT/)
            .expect(/a\.js<\/a>/)
            .end(done);
    });
});

describe('static({ root: root, indexes: false })', function () {
    function createServer() {
        var app = createApp();

        app.use(static_({
            root: FIXTURES_DIR,
            indexes: false
        }));

        return app.server;
    }

    it ('should ignore a directory', function (done) {
        request(createServer())
            .get('/css')
            .expect(404)
            .end(done);
    });

    it ('should access a file normally', function (done) {
        request(createServer())
            .get('/css/a.css')
            .expect(200)
            .expect('content-type', 'text/css')
            .expect('last-modified', /GMT/)
            .expect('.a {}\n')
            .end(done);
    });
});

describe('static(root)', function () {
    function createServer() {
        var app = createApp();

        app.use(static_(FIXTURES_DIR));

        return app.server;
    }

    it('should support the simple config', function (done) {
        request(createServer())
            .get('/')
            .expect(200)
            .expect('content-type', 'text/html')
            .expect('last-modified', /GMT/)
            .expect(/index\.html<\/a>/)
            .end(done);
    });
});

describe('static()', function () {
    function createServer() {
        var app = createApp();

        app.use(static_());

        return app.server;
    }

    it('should use "./" as the default root', function (done) {
        request(createServer())
            .get('/')
            .expect(200)
            .expect('content-type', 'text/html')
            .expect('last-modified', /GMT/)
            .expect(/package\.json<\/a>/)
            .end(done);
    });
});


