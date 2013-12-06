
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('loopback-push-notification:provider:apns');
var apn = require('apn');

function ApnsProvider(pushSettings) {
  pushSettings = pushSettings || {};
  var settings = pushSettings.apns || {};

  this._setupPushConnection(settings.pushOptions);
  this._setupFeedback(settings.feedbackOptions);
}

inherits(ApnsProvider, EventEmitter);

exports = module.exports = ApnsProvider;

ApnsProvider.prototype._setupPushConnection = function(options) {
  this._connection = new apn.Connection(options);
  this._connection.on('error', function(err) {
    // TODO(bajtos) report errors as ApnsProvider error
    // this.emit('error', err)
    // + add notification object (second arg of this fn)
    console.error('APNS connection failure: ', err);
  });
};

ApnsProvider.prototype._setupFeedback = function(options) {
  if (!options) {
    debug('Feedback channel is not enabled in the application settings.');
    return;
  }

  var self = this;
  this._feedback = new apn.Feedback(options);
  this._feedback.on('feedback', function (devices) {
    debug('Devices gone:', devices);
    self.emit('devicesGone', devices);
  });
};

ApnsProvider.prototype.pushNotification = function(notification, deviceToken) {
  var note = new apn.Notification();
  if (notification.expirationInterval) {
    note.expiry = notification.expirationInterval;
  } else if (notification.expirationTime) {
    note.expiry = (notification.expirationTime.getTime() - Date.now()) / 1000;
  }
  note.badge = notification.badge;
  note.sound = notification.sound;
  note.alert = notification.alert;
  note.payload = {};
  Object.keys(notification).forEach(function (key) {
    if (key in note) {
      return;
    }
    if (key === 'expirationInterval' || key === 'expirationTime') {
      return;
    }
    note.payload[key] = notification[key];
  });
  debug('Pushing notification to %j:', deviceToken, note);
  this._connection.pushNotification(note, deviceToken);
};
