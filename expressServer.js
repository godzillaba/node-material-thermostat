var express = require('express');
var pug = require('pug');

var routes = {
    "/": pug.compileFile("./web/index.pug")
}

var app = express();
app.use(express.static('./web'));

for (var route in routes) {
    app.get(route, function(req, res) {
        res.send(routes[route]());
    })
}

var server = app.listen(8080, function() {
    console.log('listening');
})
