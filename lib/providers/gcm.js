
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
  var self = this;

  var registrationIds = [deviceToken];
  var message = this._createMessage(notification);

  debug('Sending message to %j: %j', registrationIds, message);
  this._connection.send(message, registrationIds, 3, function (err, result) {
    if (!err && result && result.failure) {
      var code = result.results && result.results[0] && result.results[0].error;

      if (code === 'NotRegistered') {
        debug('Device %j is no longer registered.', deviceToken);
        self.emit('devicesGone', registrationIds);
        return;
      }

      err = new Error('GCM error ' + (code || 'Unknown'));
    }

    if (err) {
      debug('Cannot send message: %s', err.stack);
      self.emit('error', err);
      return;
    }

    debug('GCM result: %j', result);
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
