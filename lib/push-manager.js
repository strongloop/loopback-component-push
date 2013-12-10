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
 * Configure push notification for a given device type
 * @param deviceType
 * @param pushSettings
 * @returns {*}
 */
PushManager.prototype.configureProvider = function (deviceType, pushSettings) {
  var Provider = PushManager.providers[deviceType];
  if (!Provider) {
    debug('Error: no provider was configured for device type %j', deviceType);
    // TODO(bajtos) Report an error.
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
    var self = this;
    // Check the cache first
    if (this.applications[appId] && this.applications[appId][deviceType]) {
        if (cb) {
            process.nextTick(function () {
                cb(null, self.applications[appId][deviceType]);
            });
        }
        return;
    }

    // Look up the application object by id
    self.Application.findById(appId, function (err, application) {
        var pushSettings = application && application.pushSettings;
        if (err || !pushSettings) {
            cb && cb(err, null);
            return;
        }

        debug(
          'Setting up push notification for application id %j deviceType %j',
          application.id,
          deviceType
        );

        if (!self.applications[appId]) {
            self.applications[appId] = {};
        }

        var services = self.configureProvider(deviceType, pushSettings);

        self.applications[appId][deviceType] = services;
        cb && cb(null, self.applications[appId][deviceType]);
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

    self.configureApplication(
      reg.appId,
      reg.deviceType,
      function(err, provider) {
        if (err || !provider) {
          debug('Cannot configure application id %j - %s',
            reg.appId, err && err.stack);
          // TODO(bajtos) report error
          return;
        }
        debug('Sending notification: ',
          reg.deviceType, deviceToken, notification);

        provider.pushNotification(notification, deviceToken);
      });
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

PushManager.prototype.pushNotificationByRegistrationId = function (id, notification, cb) {
    var self = this;
    self.Device.findById(id, function (err, result) {
        if (!err && result) {
            self.pushNotification(result.deviceToken, notification);
            cb && cb(err);
        } else {
            cb && cb(err);
        }
    });
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





