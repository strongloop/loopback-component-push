
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
  if(settings.certData) {
    pushOptions.cert = pushOptions.certData || settings.certData;
    feedbackOptions.cert = feedbackOptions.certData || settings.certData;
  }
  if(settings.keyData) {
    pushOptions.key = pushOptions.keyData || settings.keyData;
    feedbackOptions.key = feedbackOptions.keyData || settings.keyData;
  }

  // Check the push mode production vs development
  if(settings.production) {
    // Always override
    pushOptions.gateway = 'gateway.push.apple.com';
    feedbackOptions.gateway = 'feedback.push.apple.com';
  } else {
    // Honor the gateway settings for testing
    pushOptions.gateway = pushOptions.gateway || 'gateway.sandbox.push.apple.com';
    feedbackOptions.gateway = feedbackOptions.gateway || 'feedback.sandbox.push.apple.com';
  }

  if(pushOptions.port !== undefined) {
    pushOptions.port  = 2195;
  }
  if(feedbackOptions.port !== undefined) {
    feedbackOptions.port  = 2196;
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

  connection.on("completed", function()    { debug("======= Completed!")});
  connection.on("connected", function()    { debug("Connected to apn server"); });

  connection.on('disconnected', function() {
    var err = new Error('apn disconnected ');
    self.emit(err);
  });
  connection.on('timeout', function() {
    var err = new Error('apn timeout ');
    self.emit(err);
  });

  connection.on('error', errorHandler);
  connection.on('socketError', errorHandler);

  connection.on('transmissionError', function(code, notification, recipient) {
    var err = new Error('Cannot send APNS notification: ' + code);
    self.emit(err, notification, recipient);
  });

  connection.on("transmitted", function(notification) {
    self.emit("transmitted", notification);
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
  /**
   * Typically you should record the timestemp when a device registers
   * with your service along with the token and update
   * it every time your app re-registers the token.
   * When the feedback service returns a token with an associated timestamp
   * which is newer than that stored by you then you should disable, or remove,
   * the token from your system and stop sending notifications to it
   */
  this._feedback.on('feedback', function (devices, deviceIfNotBatch) {
    debug('Devices gone:', devices);
    if( !devices.map && !isNaN(devices) ) {
      // not in batchFeedback: (time, device) are parameters actually
      self.emit('devicesGone', [deviceIfNotBatch.token.toString("hex")]);
    }
    var tokens = devices.map( function(d) {
      return d.device.token.toString("hex");
    });
    self.emit('devicesGone', tokens);
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
  note.priority = notification.priority;
  note.contentAvailable = notification.contentAvailable;
  note.urlArgs = notification.urlArgs;
  note.errorCallback = notification.errorCallback;
  note.payload = {};

  Object.keys(notification).forEach(function (key) {
    note.payload[key] = notification[key];
  });

  debug('Pushing notification to %j:', deviceToken, note);
  this._connection.pushNotification(note, deviceToken);
};