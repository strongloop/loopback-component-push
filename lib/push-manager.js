var assert = require('assert');
var format = require('util').format;
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
 * Push notification to a given device
 * @param notification
 * @param deviceToken
 */
PushManager.prototype.pushNotification = function(deviceToken, notification) {
  var self = this;
  debug('Request to send notification to %j:', deviceToken, notification);
  this.Device.findOne({where: {deviceToken: deviceToken}}, function(err, reg) {
    if (err || !reg) {
      debug('Unknown device token %j (error: %j)', deviceToken, err);
      // TODO(bajtos) report error
      return;
    }

    self._pushNotification(reg);
  });
};

/**
 * Push notification based the application
 * @param appId
 * @param appVersion
 * @param notification
 */
PushManager.prototype.pushNotificationByApp = function (deviceType, appId, appVersion, notification, cb) {
    var self = this;
    if (!deviceType) {
        deviceType = undefined;
    }
    self.Device.findByApp(deviceType, appId, appVersion, function (err, regs) {
        if (!err) {
            regs.forEach(function (r) {
                self.pushNotification(r.deviceToken, notification);
            });
            cb && cb(err, regs);
        } else {
            cb && cb(err, regs);
        }
    });
};

/**
 * Push notification based the user
 * @param userId
 * @param notification
 */
PushManager.prototype.pushNotificationByUser = function (deviceType, userId, notification, cb) {
    var self = this;
    if (!deviceType) {
        deviceType = undefined;
    }
    self.Device.findByUser(deviceType, userId, function (err, regs) {
        if (!err) {
            regs.forEach(function (r) {
                self.pushNotification(r.deviceToken, notification);
            });
            cb && cb(err, regs);
        } else {
            cb && cb(err, regs);
        }
    });
};

PushManager.prototype.pushNotificationByRegistrationId = function (id,
                                                                   notification,
                                                                   cb) {
  assert.ok(cb, 'callback should be defined');

  var self = this;
  self.Device.findById(id, function (err, device) {
    if (err) return cb(err);
    if (!device) {
      var msg = 'Device id ' + id + ' not found';
      debug('pushNotificationByRegistrationId failed: ' + msg);
      err = new Error(msg);
      err.details = { deviceId: id };
      return cb(err);
    }
    self._pushNotification(device, notification, cb);
  });
};

PushManager.prototype._pushNotification = function(device, notification, cb) {
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

setRemoting(PushManager.prototype.pushNotification, {
    description: 'Send a push notification by device token',
    accepts: [
        {arg: 'deviceToken', type: 'string', description: 'Device token', http: {source: 'query'}},
        {arg: 'notification', type: 'object', description: 'Notification', http: {source: 'body'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'post', path: '/byDevice'}
});

setRemoting(PushManager.prototype.pushNotificationByApp, {
    description: 'Send a push notification by user id',
    accepts: [
        {arg: 'deviceType', type: 'string', description: 'Device type', http: {source: 'query'}},
        {arg: 'appId', type: 'string', description: 'Application id', http: {source: 'query'}},
        {arg: 'appVersion', type: 'string', description: 'Application version', http: {source: 'query'}},
        {arg: 'notification', type: 'object', description: 'Notification', http: {source: 'body'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'post', path: '/byApp'}
});

setRemoting(PushManager.prototype.pushNotificationByUser, {
    description: 'Send a push notification by user id',
    accepts: [
        {arg: 'deviceType', type: 'string', description: 'Device type', http: {source: 'query'}},
        {arg: 'userId', type: 'string', description: 'User id', http: {source: 'query'}},
        {arg: 'notification', type: 'object', description: 'Notification', http: {source: 'body'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'post', path: '/byUser'}
});

setRemoting(PushManager.prototype.pushNotificationByUser, {
    description: 'Send a push notification by user id',
    accepts: [
        {arg: 'registrationId', type: 'string', description: 'Registration id', http: {source: 'query'}},
        {arg: 'notification', type: 'object', description: 'Notification', http: {source: 'body'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'post', path: '/byRegistrationId'}
});





