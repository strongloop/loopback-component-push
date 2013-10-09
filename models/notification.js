var loopback = require('loopback');

/**
 * Notification Model
 */
var Notification = loopback.createModel(
    'Notification',
    {
        id: {
            type: String,
            id: true,
            generated: true
        },
        deviceType: String, // The device type such as apns
        deviceToken: String, // The device token
        alert: String, // the notification's message
        badge: Number, // (iOS) the value indicated in the top right corner of the app icon. This can be set to a value or to -1 in order to increment the current value by 1
        sound: String, // (iOS) the name of a sound file in the application bundle
        action: String,  // (Android) the Intent should be fired when the push is received. If not title or alert values are specified, the Intent will be fired but no notification will appear to the user
        title: String, // (Android) the value displayed in the Android system tray notification
        created: Date, // The date that the notification is created
        modified: Date, // The date that the notifcation is modified
        scheduledTime: Date, // The time that the notification should be sent
        expirationTime: Date, // The time that the notification should be expired
        expirationInterval: Number, // The expiration interval in seconds after the scheduled time
        status: String // The status of the notification
    }
);

Notification.beforeCreate = function (next) {
    var notification = this;
    notification.created = notification.modified = notification.scheduledTime = new Date();
    next();
};

module.exports = Notification;



