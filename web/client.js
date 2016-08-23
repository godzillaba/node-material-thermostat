var app = angular.module('app', []);

var pubnub = PUBNUB({
    publish_key: "pub-c-ad62656b-7dc1-45f3-8f74-4135ee8d0eb4",
    subscribe_key: "sub-c-a7fd2c00-65b3-11e6-9898-0619f8945a4f"
})

app.controller('appController', function($scope) {
    var vm = this;
    window.vm = vm;

    vm.state = {
        currentTemp: null,
        hvacMode: null,
        targetTemp: null
    }

    vm.publish = function(message) {
        pubnub.publish({
            channel: "nhc-rtc",
            message: message
        });
    }

    vm.getState = function() {
        vm.publish({
            serverQuery: {
                type: "getState"
            }
        });
    }

    vm.publishState = function() {
        vm.publish({
            event: {
                type: "stateChange",
                attributes: vm.state
            }
        })
    }

    vm.handleMessage = function(message) {
        if ("event" in message) {
            var attrs = message.event.attributes;
            for (key in attrs) {
                vm.state[key] = attrs[key];
            }
        }
    }

    vm.stepTarget = function(amt) {
        vm.state.targetTemp += amt;
        vm.publishState();
    }

    pubnub.subscribe({
        channel: 'nhc-rtc',
        message: function(message) {
            $scope.$apply(vm.handleMessage(message));
        },
        connect: vm.getState
    });

});

app.filter("capitalize", function() {
    return function(str) {
        return str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
            return letter.toUpperCase();
        });
    }
})
