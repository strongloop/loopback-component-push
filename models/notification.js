var loopback = require('loopback');

/**
 * Notification Model
 *
 * See the official documentation for more details on provider-specific
 * properties.
 *
 * [Android - GCM](http://developer.android.com/google/gcm/server.html#params)
 *
 * [iOS - APN](http://bit.ly/apns-notification-payload)
 *
 * @property {Any} alert The notification's message (iOS only - use `message` on Android).
 * @property {Number} badge The value indicated in the top right corner of the app icon.
 * @property {String} category The category for the push notification action (iOS8+ only).
 * @property {String} collapseKey  An arbitrary string (such as "Updates Available") used
 * to collapse a group of like messages when the device is offline,
 * so only the last message gets sent to the client (Android only).
 * @property {Date} created The date that the notification is created.
 * @property {Boolean} delayWhileIdle  If the device is idle, do not send the message immediately.
 * The server will wait for the device to become active, and then only the last message for
 * each `collapse_key` value will be sent (Android only).
 * @property {String} deviceToken The device token as provided by GCM or APN.
 * @property {String} deviceType The device type such as `ios`.
 * Set to -1 to increment the current value by one (iOS only).
 * @property {Number} expirationInterval The expiration interval in seconds.
 * The interval starts at the time when the notification is sent to the push notification provider.
 * @property {Date} expirationTime The time that the notification expires.
 * @property {String} message  The notification's message (Android only - use `alert` on iOS).
 * @property {Date} modified The date that the notifcation is modified.
 * @property {Date} scheduledTime The time that the notification should be sent (not supported yet).
 * @property {String} sound  The name of a sound file in the application bundle (iOS only).
 * @property {String} status Status of the notification (not supported yet).
 * 
 * @class Notification
 * @header Notification
 */
var Notification = loopback.createModel(
  'Notification',
  {
    id: {
      type: String,
      id: true,
      generated: true
    },

    /**
     * The device type such as `ios`.
     */
    deviceType: {type: String, required: true},

    /**
     * The device token as provided by GCM/APN/etc.
     */
    deviceToken: {type: String, required: true},

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
     * The name of a sound file in the application bundle.
     */
    sound: String,

    /**
     * (iOS8+ only)
     * The category for the push notification action
     */
    category: String,

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

    /**
     * The date that the notification is created.
     */
    created: Date,

    /**
     *The date that the notifcation is modified.
     */
    modified: Date,

    /**
     * The time that the notification should be sent.
     * (not supported yet)
     */
    scheduledTime: Date,

    /**
     * The time that the notification should be expired.
     */
    expirationTime: Date,

    /**
     * The expiration interval in seconds.
     * The interval starts at the time when the notification is sent
     * to the push notification provider.
     */
    expirationInterval: Number,

    /**
     * The status of the notification.
     * (not supported yet)
     */
    status: String
  }
);

// Avoid exposure of internal properties such __data
Notification.hideInternalProperties = true;

Notification.beforeCreate = function(next) {
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
