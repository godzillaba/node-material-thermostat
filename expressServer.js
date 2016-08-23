var express = require('express');
var pug = require('pug');
var config = require('config').get('expressServer');

var routes = {
    "/": "./web/index.pug"
}

var routeFuncs = {};

var app = express();
app.use(express.static('./web'));

for (var route in routes) {
    if (config.precompilePug) {
        routeFuncs[route] = pug.compileFile(routes[route]);
    } else {
        routeFuncs[route] = function() {
            return pug.renderFile(routes[route]);
        }
    }

    app.get(route, function(req, res) {
        res.send(routeFuncs[route]());
    })
}

var server = app.listen(config.port, function() {
    console.log(server.address());
})
