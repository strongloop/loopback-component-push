
var inherits = require('util').inherits;
var extend = require('util')._extend;
var EventEmitter = require('events').EventEmitter;
var gcm = require('node-gcm');

function GcmProvider(pushSettings) {
  var settings = pushSettings.gcm || {};
  this._setupPushConnection(settings.pushOptions);
}

inherits(GcmProvider, EventEmitter);

exports = module.exports = GcmProvider;

GcmProvider.prototype._setupPushConnection = function(options) {
  this._connection = new gcm.Sender(options.serverKey);
  this._pushOptions = extend({}, options);
};

GcmProvider.prototype.pushNotification = function(notification, deviceToken) {
  var registrationIds = [deviceToken];

  // TODO(bajtos) support Notification properties like expirationInterval
  var message = new gcm.Message({
    collapseKey: this._pushOptions.collapseKey || 'loopback',
    delayWhileIdle: this._pushOptions.delayWhileIdle || true,
    timeToLive: 3,
    data: {}
  });

  Object.keys(notification).forEach(function(key) {
    message.data[key] = notification[key];
  });

  this._connection.send(message, registrationIds, 3, function (err, result) {
    // TODO(bajtos) report errors, handle NotRegistered error as "device gone"
    console.log(result);
  });
};
