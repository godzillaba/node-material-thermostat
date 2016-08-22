var PubNub = require('pubnub');

pubnub = new PubNub({
    publishKey: "pub-c-ad62656b-7dc1-45f3-8f74-4135ee8d0eb4",
    subscribeKey: "sub-c-a7fd2c00-65b3-11e6-9898-0619f8945a4f"
});

pubnub.subscribe({
    channels: ["nhc-rtc"]
});

exports.emit = function(eventType, eventAttrs) {
    var message = {
        event: {
            type: eventType,
            attributes: eventAttrs
        }
    };
    pubnub.publish({
        channel: "nhc-rtc",
        message: message
    });
}

exports.on = function(eventName, handler) {
    pubnub.addListener({
        message: function(message) {
            if ("event" in message.message && message.message.event.type === eventName) {
                handler(message.message.event);
            }
        }
    });
}

exports.onQuery = function(queryName, handler) {
    pubnub.addListener({
        message: function(message) {
            if ("serverQuery" in message.message && message.message.serverQuery.type === queryName) {
                handler(message.message.query);
            }
        }
    })
}
