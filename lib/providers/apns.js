
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('loopback:component:push:provider:apns');
var apn = require('apn');

function ApnsProvider(pushSettings) {
  pushSettings = pushSettings || {};
  var settings = pushSettings.apns || {};
  var pushOptions = settings.pushOptions || {};
  var feedbackOptions = settings.feedbackOptions || {};

  // Populate the shared cert/key data
  // The 1.7.x version of apn module defaults cert to `cert.pem` and
  // key to `key.pem`. It also uses cert/key over certData/keyData.
  // The following code tries to honor certData/keyData over cert/key.
  pushOptions.certData = pushOptions.certData || settings.certData;
  pushOptions.keyData = pushOptions.keyData || settings.keyData;

  pushOptions.cert = pushOptions.cert || settings.cert || null;
  pushOptions.key = pushOptions.key || settings.key || null;

  feedbackOptions.certData = feedbackOptions.certData || settings.certData ||
    pushOptions.certData;

  feedbackOptions.keyData = feedbackOptions.keyData || settings.keyData ||
    pushOptions.keyData;

  feedbackOptions.cert = feedbackOptions.cert || settings.cert ||
    pushOptions.cert;
  feedbackOptions.key = feedbackOptions.key || settings.key ||
    pushOptions.key;

  if (!pushOptions.certData) {
    delete pushOptions.certData;
    if (!pushOptions.cert) {
      delete pushOptions.cert;
    }
  } else {
    pushOptions.cert = null;
  }

  if (!pushOptions.keyData) {
    delete pushOptions.keyData;
    if (!pushOptions.key) {
      delete pushOptions.key;
    }
  } else {
    pushOptions.key = null;
  }

  if (!feedbackOptions.certData) {
    delete feedbackOptions.certData;
    if (!feedbackOptions.cert) {
      delete feedbackOptions.cert;
    }
  } else {
    feedbackOptions.cert = null;
  }

  if (!feedbackOptions.keyData) {
    delete feedbackOptions.keyData;
    if (!feedbackOptions.key) {
      delete feedbackOptions.key;
    }
  } else {
    feedbackOptions.key = null;
  }

  // Check the push mode production vs development
  if(settings.production) {
    // Always override
    pushOptions.gateway = 'gateway.push.apple.com';
    feedbackOptions.gateway = 'feedback.push.apple.com';
    if(pushOptions.port !== undefined) {
      pushOptions.port  = 2195;
    }
    if(feedbackOptions.port !== undefined) {
      feedbackOptions.port  = 2196;
    }

  } else {
    // Honor the gateway settings for testing
    pushOptions.gateway = pushOptions.gateway || 'gateway.sandbox.push.apple.com';
    feedbackOptions.gateway = feedbackOptions.gateway || 'feedback.sandbox.push.apple.com';
  }

  // Keep the options for testing verification
  this._pushOptions = pushOptions;
  this._feedbackOptions = feedbackOptions;

  this._setupPushConnection(pushOptions);
  this._setupFeedback(feedbackOptions);
}

inherits(ApnsProvider, EventEmitter);

exports = module.exports = ApnsProvider;

ApnsProvider.prototype._setupPushConnection = function(options) {
  var self = this;
  if(options && !options.port){
    delete options.port;  
  }
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
  this._feedback.on('error', function (err) {
    debug('Error:', err);
    self.emit('error', err);
  });
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
  note.category = notification.category;
  note.payload = {};

  Object.keys(notification).forEach(function (key) {
    note.payload[key] = notification[key];
  });

  debug('Pushing notification to %j:', deviceToken, note);
  this._connection.pushNotification(note, deviceToken);
};
