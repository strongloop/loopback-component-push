var apn = require('apn');
var gcm = require('node-gcm');

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
    this.debug = settings.debug;
}

/**
 * Configure push notification for a given device type
 * @param deviceType
 * @param pushSettings
 * @returns {*}
 */
PushManager.prototype.configureProvider = function (deviceType, pushSettings) {
    var self = this;
    var pushOptions, feedbackOptions;
    if (deviceType === 'ios') {
        pushOptions = pushSettings.apns && pushSettings.apns.pushOptions;
        feedbackOptions = pushSettings.apns && pushSettings.apns.feedbackOptions;

        var feedback, push;
        if (feedbackOptions) {
            feedback = new apn.Feedback(feedbackOptions);
            feedback.on("feedback", function (devices) {
                devices.forEach(function (device) {
                    self.Device.deleteAll({where: {deviceType: 'ios', deviceToken: device}});
                });
            });
        }

        push = new apn.Connection(pushOptions);
        push.on('error', function (err) {
            console.error('APNS connection failure: ', err);
        });
        return {
            feedback: feedback,
            push: {
                pushNotification: function (notification, deviceToken) {
                    if (notification instanceof self.Notification) {
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
                        push.pushNotification(note, deviceToken);
                    } else {
                        push.pushNotification(notification, deviceToken);
                    }
                }
            }
        };
    } else if (deviceType === 'android') {
        pushOptions = pushSettings.gcm && pushSettings.gcm.pushOptions;
        var sender = new gcm.Sender(pushOptions.serverKey);
        return {
            push: {
                pushNotification: function (notification, deviceToken) {
                    var registrationIds = [deviceToken];
                    var message = new gcm.Message({
                        collapseKey: pushOptions.collapseKey || 'loopback',
                        delayWhileIdle: pushOptions.delayWhileIdle || true,
                        timeToLive: 3,
                        data: notification
                    });
                    sender.send(message, registrationIds, 3, function (err, result) {
                        console.log(result);
                    });
                }
            }
        };
    } else {
        return null;
    }
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
        if (self.debug) {
            console.log('Setting up push notification for application: ' + application.id + ' deviceType: ' + deviceType);
        }
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
PushManager.prototype.pushNotification = function (deviceToken, notification) {
    var self = this;
    if (self.debug) {
        console.log('Request to send notification: ', deviceToken, notification);
    }
    this.Device.findOne({where: {deviceToken: deviceToken}}, function (err, reg) {
        if (reg) {
            self.configureApplication(reg.appId, reg.deviceType, function (err, provider) {
                var push = provider && provider.push;
                if (push) {
                    if (self.debug) {
                        console.log('Sending notification: ', reg.deviceType, deviceToken, notification);
                    }
                    push.pushNotification(notification, deviceToken);
                }
            });
        }
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
        if (!err) {
            self.pushNotification(result.deviceToken, notification);
            cb && cb(err, regs);
        } else {
            cb && cb(err, regs);
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





