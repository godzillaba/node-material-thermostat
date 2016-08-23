var hvac = require('./hvac.js');
var pnHelper = require('./pubnubHelper.js');
var expressServer = require('./expressServer.js');
var config = require('config');

var currentTemp = null;

setInterval(function() {
    hvac.checkTemp(function(err, temp) {
        if (currentTemp != temp) {
            currentTemp = temp;

            pnHelper.emit("stateChange", {
                currentTemp: temp
            });
        };
    });
}, config.get('hvac').pollInterval);

pnHelper.on("stateChange", function(ev) {
    var attrs = ev.attributes;
    for (key in attrs) {
        var val = attrs[key];
        switch (key) {
            case "currentTemp":
                currentTemp = val;
                break;
            case "hvacMode":
            case "targetTemp":
                hvac[key] = val;
                break;
        }
    }
});

pnHelper.onQuery("getState", function(q) {
    pnHelper.emit("stateChange", {
        currentTemp: currentTemp,
        hvacMode: hvac.hvacMode,
        targetTemp: hvac.targetTemp
    });
});
