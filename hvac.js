var ds = require('ds18x20');
var gpio = require('pi-gpio');
var config = require('config').get('hvac');

const SENSOR_ID = ds.list()[0];

function tryToFahrenheit(t) {
    if (config.fahrenheit) return Math.round((t*9/5 + 32)*10)/10;
    else return t;
}

function doHVAC(current, target) {
    function cool() {
        console.log("cool " + current + " " + target);
        gpio.write(config.hvacPins.fan, 0);
        gpio.write(config.hvacPins.compressor, 0);
        gpio.write(config.hvacPins.heat, 1);
    }
    function heat() {
        console.log("heat " + current + " " + target);
        gpio.write(config.hvacPins.fan, 1);
        gpio.write(config.hvacPins.compressor, 1);
        gpio.write(config.hvacPins.heat, 0);
    }
    function off() {
        console.log("off " + current + " " + target);
        gpio.write(config.hvacPins.fan, 1);
        gpio.write(config.hvacPins.compressor, 1);
        gpio.write(config.hvacPins.heat, 1);
    }

    var diff = target - current;

    if (diff < 0 && (exports.hvacMode === "cool" || exports.hvacMode === "auto")) {
        cool();
    }
    else if (diff > 0 && (exports.hvacMode === "heat" || exports.hvacMode === "auto")) {
        heat();
    }
    else {
        off();
    }
}

exports.checkTemp = function(callback) {
    ds.get(SENSOR_ID, function(err, temp) {
        if (err) {
            console.error(err);
        } else {
            temp = tryToFahrenheit(temp);
            exports.currentTemp = temp;
            doHVAC(exports.currentTemp, exports.targetTemp);
        }
        if (typeof callback != "undefined") {
            callback(err, temp);
        }
    });
}

///////////////////////////////////////////

exports.targetTemp = 75;
exports.hvacMode = "off";
exports.currentTemp = tryToFahrenheit(ds.get(SENSOR_ID));

for (var pinName in config.hvacPins) {
    var cPin = config.hvacPins[pinName];
    gpio.open(cPin, "output", function(){
        gpio.write(cPin, 1);
    });
}
