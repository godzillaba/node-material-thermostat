var PubNub = require('pubnub');
var config = require('config').get('pubnub');

pubnub = new PubNub({
    publishKey: config.publishKey,
    subscribeKey: config.subscribeKey
});

pubnub.subscribe({
    channels: [config.channel]
});

exports.emit = function(eventType, eventAttrs) {
    var message = {
        event: {
            type: eventType,
            attributes: eventAttrs
        }
    };
    pubnub.publish({
        channel: config.channel,
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
