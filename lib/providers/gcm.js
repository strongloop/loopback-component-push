
var inherits = require('util').inherits;
var extend = require('util')._extend;
var EventEmitter = require('events').EventEmitter;
var gcm = require('node-gcm');
var debug = require('debug')('loopback-push-notification:provider:gcm');

function GcmProvider(pushSettings) {
  var settings = pushSettings.gcm || {};
  this._setupPushConnection(settings);
}

inherits(GcmProvider, EventEmitter);

exports = module.exports = GcmProvider;

GcmProvider.prototype._setupPushConnection = function(options) {
  debug('Using GCM Server API key %j', options.serverApiKey);
  this._connection = new gcm.Sender(options.serverApiKey);
};

GcmProvider.prototype.pushNotification = function(notification, deviceToken) {
  var registrationIds = [deviceToken];

  var message = this._createMessage(notification);

  debug('Sending message to %j: %j', registrationIds, message);
  this._connection.send(message, registrationIds, 3, function (err, result) {
    // TODO(bajtos) report errors, handle NotRegistered error as "devicesGone"
    debug('GCM result: ' + result);
  });
};

GcmProvider.prototype._createMessage = function(notification) {
  // Message parameters are documented here:
  //   http://developer.android.com/google/gcm/server.html#params
  var message = new gcm.Message({
    timeToLive: notification.getTimeToLiveInSecondsFromNow(),
    collapseKey: notification.collapseKey,
    delayWhileIdle: notification.delayWhileIdle
  });

  Object.keys(notification).forEach(function(key) {
    message.addData(key, notification[key]);
  });

  return message;
};
