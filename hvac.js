var ds = require('ds18x20');
var gpio = require('pi-gpio');

const SENSOR_ID = ds.list()[0];
const HVAC_PINS = {
    fan: 40,
    compressor: 22,
    heat: 18
}
const FAHRENHEIT = true;

function tryToFahrenheit(t) {
    if (FAHRENHEIT) return Math.round((t*9/5 + 32)*10)/10;
    else return t;
}

function doHVAC(current, target) {
    function cool() {
        console.log("cool " + current + " " + target);
        gpio.write(HVAC_PINS.fan, 0);
        gpio.write(HVAC_PINS.compressor, 0);
        gpio.write(HVAC_PINS.heat, 1);
    }
    function heat() {
        console.log("heat " + current + " " + target);
        gpio.write(HVAC_PINS.fan, 1);
        gpio.write(HVAC_PINS.compressor, 1);
        gpio.write(HVAC_PINS.heat, 0);
    }
    function off() {
        console.log("off " + current + " " + target);
        gpio.write(HVAC_PINS.fan, 1);
        gpio.write(HVAC_PINS.compressor, 1);
        gpio.write(HVAC_PINS.heat, 1);
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


for (var pinName in HVAC_PINS) {
    var cPin = HVAC_PINS[pinName];
    gpio.open(cPin, "output", function(){
        gpio.write(cPin, 1);
    });
}
