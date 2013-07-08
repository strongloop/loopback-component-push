var apn = require('apn');

/**
 * Exports a function to bootstrap APNS
 * @param options An object to configure APNS
 * @returns {{}}
 */
module.exports = PushService;

function PushService(options) {
    if (!(this instanceof PushService)) {
        return new PushService(options);
    }

    var self = this;
    options = options || {};
    if (!options.dataSource) {
        throw new Error('Required property dataSource is missing from options: ' + options);
    }
    this.DeviceRegistration = require('../models/device-registration')(options.dataSource);

    var config = options.config && options.config.apns;
    var pushOptions = config && config.pushOptions;
    var feedbackOptions = config && config.feedbackOptions;

    if (feedbackOptions) {
        this.feedback = new apn.Feedback(feedbackOptions);
        this.feedback.on("feedback", function (devices) {
            devices.forEach(function (device) {
                self.DeviceRegistration.find({where: {deviceType: 'apns', deviceToken: device}}, function (err, results) {
                    results.forEach(function (reg) {
                        reg.destroy();
                    });
                });
            });
        });
    }

    this.apnConnection = new apn.Connection(pushOptions);
    this.apnConnection.on('error', function (err) {
        console.error(err);
    });
}


/**
 * Push notification to a given device
 * @param deviceToken
 * @param notification
 */
PushService.prototype.pushNotification = function (deviceToken, notification) {
    this.apnConnection.pushNotification(notification, deviceToken);
}

/**
 * Push notification based the application
 * @param appId
 * @param appVersion
 * @param notification
 */
PushService.prototype.pushNotificationByApp = function (appId, appVersion, notification, cb) {
    var self = this;
    self.DeviceRegistration.findByApp('apns', appId, appVersion, function (err, regs) {
        if (!err) {
            regs.forEach(function (r) {
                self.apnConnection.pushNotification(notification, r.deviceToken);
            });
            cb && cb(err, regs);
        } else {
            cb && cb(err, regs);
        }
    });
}

/**
 * Push notification based the user
 * @param userId
 * @param notification
 */
PushService.prototype.pushNotificationByUser = function (userId, notification, cb) {
    var self = this;
    self.DeviceRegistration.findByUser('apns', userId, function (err, regs) {
        if (!err) {
            regs.forEach(function (r) {
                self.apnConnection.pushNotification(notification, r.deviceToken);
            });
            cb && cb(err, regs);
        } else {
            cb && cb(err, regs);
        }
    });
}

PushService.prototype.pushNotificationByRegistrationId = function(id, notification, cb) {
    var self = this;
    self.DeviceRegistration.findById(id, function(err, result) {
        if (!err) {
            self.apnConnection.pushNotification(notification, result.deviceToken);
            cb && cb(err, regs);
        } else {
            cb && cb(err, regs);
        }
    });
}




