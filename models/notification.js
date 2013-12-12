var loopback = require('loopback');

/**
 * Notification Model
 *
 * See the official documentation for more details on provider-specific
 * properties.
 * [Android (GCM)]{
 * @link http://developer.android.com/google/gcm/server.html#params}
 * [iOS (APN)]{@link http://bit.ly/apns-notification-payload}
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

        /**
         * (iOS only)
         * The notification's message.
         */
        alert: 'any',

        /**
         * (iOS only)
         * The value indicated in the top right corner of the app icon.
         * This can be set to a value or to -1 in order to increment
         * the current value by 1.
         */
        badge: Number,

        /**
         * (iOS only)
         * The name of a sound file in the application bundle
         */
        sound: String,

        /**
         * (Android only)
         * An arbitrary string (such as "Updates Available") that is used
         * to collapse a group of like messages when the device is offline,
         * so that only the last message gets sent to the client.
         */
        collapseKey: String,

        /**
         * (Android only)
         * Indicates that the message should not be sent immediately
         * if the device is idle. The server will wait for the device
         * to become active, and then only the last message for each
         * collapse_key value will be sent.
         */
        delayWhileIdle: Boolean,

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

Notification.prototype.getTimeToLiveInSecondsFromNow = function() {
  if (this.expirationInterval)
    return this.expirationInterval;

  if (this.expirationTime)
    return (this.expirationTime.getTime() - Date.now()) / 1000;

  return undefined;
};

module.exports = Notification;



