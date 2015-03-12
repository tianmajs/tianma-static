'use strict';

var request = require('supertest'),
    local = require('..'),
    path = require('path'),
    util = require('util'),
    tianma = require('tianma');

function mix(object, config){
    for(var key in config){
        object[key] = config[key];
    }
    return object;
}

function createApp(config, port){
    port = port || 3000;

    var app = tianma(port);

    app.use(local(mix({
        root: path.join(__dirname,'./fixtures'),
        indexes:['index.html']
    },config)));
    return app;
}

describe('tianma-static', function(){
   var app = createApp().run,
       reqApp = request(app);

    it('should support access a file', function(done){
       reqApp.get('/a.js')
           .expect(200)
           .expect('Content-Type', /javascript/)
           .end(done);
    });

    it('should support access a directory', function(done){
        reqApp.get('/css')
            .expect(200)
            .end(done);
    });

    it('should support config indexes', function(done){
        reqApp.get('/')
            .expect('Content-Type', /html/)
            .expect(200)
            .end(done);
    });

    it('should support forbidden index service', function(done){
        var oApp = createApp({autoIndex: false}, 4001);

        request(oApp.run)
            .get('/css')
            .expect(403)
            .end(done);
    });

});

