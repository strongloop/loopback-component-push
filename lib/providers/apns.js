
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
  var self = this;
  var connection = new apn.Connection(options);

  function errorHandler(err) {
    debug('Cannot initialize APNS connection. %s', err.stack);
    self.emit('error', err);
  }

  connection.on('error', errorHandler);
  connection.on('socketError', errorHandler);

  connection.on('transmissionError', function(code, notification, recipient) {
    var err = new Error('Cannot send APNS notification: ' + code);
    self.emit(err, notification, recipient);
  });

  this._connection = connection;
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
  // Note parameters are described here:
  //   http://bit.ly/apns-notification-payload
  var note = new apn.Notification();
  note.expiry = notification.getTimeToLiveInSecondsFromNow() || note.expiry;
  note.badge = notification.badge;
  note.sound = notification.sound;
  note.alert = notification.alert;
  note.payload = {};

  Object.keys(notification).forEach(function (key) {
    note.payload[key] = notification[key];
  });

  debug('Pushing notification to %j:', deviceToken, note);
  this._connection.pushNotification(note, deviceToken);
};
