var assert = require('assert');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var format = require('util').format;
var async = require('async');
var providers = require('./providers');
var debug = require('debug')('loopback-push-notification:push-manager');

/**
 * Exports a function to bootstrap APNS
 * @param settings An object to configure APNS
 */
module.exports = PushManager;

function PushManager(settings) {
    if (!(this instanceof PushManager)) {
        return new PushManager(settings);
    }

    settings = settings || {};

    this.Device = settings.Device || require('../models/device');
    this.Notification = settings.Notification || require('../models/notification');
    this.Application = settings.Application || require('loopback').Application;

    this.applications = {};
}

inherits(PushManager, EventEmitter);

/**
 * Registry of providers
 * Key: device type, e.g. 'ios' or 'android'
 * Value: constructor function, e.g providers.ApnsProvider
 */
PushManager.providers = {
  ios: providers.ApnsProvider,
  android: providers.GcmProvider
};

/**
 * Configure push notification for a given device type. Return null when
 * no provider is registered for the device type.
 * @param deviceType
 * @param pushSettings
 * @returns {*}
 */
PushManager.prototype.configureProvider = function (deviceType, pushSettings) {
  var Provider = PushManager.providers[deviceType];
  if (!Provider) {
    return null;
  }

  var provider = new Provider(pushSettings);
  provider.on('devicesGone', function(deviceTokens) {
    this.Device.destroyAll({
      deviceType: deviceType,
      deviceToken: { inq: deviceTokens }
    });
  }.bind(this));

  provider.on('error', function(err) {
    this.emit('error', err);
  }.bind(this));

  return provider;
};

/**
 * Lookup or set up push notification service for the given appId
 * @param appId
 * @returns {*}
 */
PushManager.prototype.configureApplication = function (appId, deviceType, cb) {
  assert.ok(cb, 'callback should be defined');

  var self = this;
  var msg;

  // Check the cache first
  if (this.applications[appId] && this.applications[appId][deviceType]) {
    return process.nextTick(function () {
      cb(null, self.applications[appId][deviceType]);
    });
  }

  // Look up the application object by id
  self.Application.findById(appId, function (err, application) {
    if (err) {
      debug('Cannot find application with id %j: %s',
        appId, err.stack || err.message);
      return cb(err);
    }

    if (!application) {
      msg = format(
        'Cannot configure push notifications - unknown application id %j',
        appId);
      debug('Error: %s', msg);

      err = new Error(msg);
      err.details = { appId: appId };
      return cb(err);
    }

    var pushSettings = application.pushSettings;
    if (!pushSettings) {
      msg = format(
        'No push settings configured for application %j (id: %j)',
        application.name, application.id);
      debug('Error: %s', msg);

      err = new Error(msg);
      err.details = {
        application: {
          id: application.id,
          name: application.name
        }
      };
      return cb(err);
    }

    debug(
      'Setting up push notification for application id %j deviceType %j',
      application.id,
      deviceType
    );

    if (!self.applications[appId]) {
      self.applications[appId] = {};
    }

    var provider = self.configureProvider(deviceType, pushSettings);

    if (!provider) {
      msg = 'There is no provider registered for deviceType ' + deviceType;
      debug('Error: %s', msg);
      err = new Error(msg);
      err.details = {
        deviceType: deviceType
      };
      return cb(err);
    }

    self.applications[appId][deviceType] = provider;
    cb(null, provider);
  });
};


/**
 * Push a notification to the device with the given registration id.
 * @param {Object} registrationId Registration id created by call to Device.create().
 * @param {Notification} notification The notification to send.
 * @param {function(Error=)} cb
 */
PushManager.prototype.notifyById = function (registrationId, notification, cb) {
  assert.ok(cb, 'callback should be defined');

  var self = this;
  self.Device.findById(registrationId, function (err, device) {
    if (err) return cb(err);
    if (!device) {
      var msg = 'Device id ' + registrationId + ' not found';
      debug('notifyById failed: ' + msg);
      err = new Error(msg);
      err.details = { deviceId: registrationId };
      return cb(err);
    }
    self.notify(device, notification, cb);
  });
};

/**
 * Push a notification to all devices matching the given query.
 * @param {Object} deviceQuery Device query, e.g.
 *  `{ appId: 'iCarsAppId', userId: 'jane.smith.id' }`
 * @param {Notification} notification The notification to send.
 * @param {function(Error=)} cb
 */
PushManager.prototype.notifyByQuery = function(deviceQuery, notification, cb) {
  assert.ok(cb, 'callback should be defined');

  var self = this;
  var filter = { where: deviceQuery };
  self.Device.find(filter, function(err, deviceList) {
    if (err) return cb(err);
    async.each(
      deviceList,
      function(device, next) {
        self.notify(device, notification, next);
      },
      cb
    );
  });
};

/**
 * Push a notification to the given device. This is a low-level function
 * used by the other higher-level APIs like `notifyById` and `notifyByQuery`.
 * @param {Device} device Device instance - the recipient.
 * @param {Notification} notification The notification to send.
 * @param {function(Error=)} cb
 */
PushManager.prototype.notify = function(device, notification, cb) {
  assert(cb, 'callback should be defined');
  var appId = device.appId;
  var deviceToken = device.deviceToken;
  var deviceType = device.deviceType;

  this.configureApplication(
    appId,
    deviceType,
    function(err, provider) {
      if (err) return cb(err);

      debug('Sending notification: ', deviceType, deviceToken, notification);
      provider.pushNotification(notification, deviceToken);
      cb();
    }
  );
};

/*!
 * Configure the remoting attributes for a given function
 * @param {Function} fn The function
 * @param {Object} options The options
 * @private
 */
function setRemoting(fn, options) {
    options = options || {};
    for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
            fn[opt] = options[opt];
        }
    }
    fn.shared = true;
}

setRemoting(PushManager.prototype.notifyById, {
  description: 'Send a push notification by registration id',
  accepts: [
    {arg: 'registrationId', type: 'string', description: 'Registration id', http: {source: 'query'}},
    {arg: 'notification', type: 'object', description: 'Notification', http: {source: 'body'}}
  ],
  returns: {arg: 'data', type: 'object', root: true},
  http: {verb: 'post', path: '/byRegistrationId'}
});

setRemoting(PushManager.prototype.notifyByQuery, {
  description: 'Send a push notification by device query',
  accepts: [
    {arg: 'deviceQuery', type: 'object', description: 'Device query', http: {source: 'body'}},
    {arg: 'notification', type: 'object', description: 'Notification', http: {source: 'body'}}
  ],
  returns: {arg: 'data', type: 'object', root: true},
  http: {verb: 'post', path: '/byQuery'}
});
