module.exports = function (options) {
    var apn = require('apn');

    options = options || {};
    var DeviceRegistration = require('../models/device-registration')(options.dataSource);
    var config = options.config;

    var pushOptions = config.apns.pushOptions;

    var feedbackOptions = config.apns.feedbackOptions;

    var feedback = new apn.Feedback(feedbackOptions);

    feedback.on("feedback", function (devices) {
        devices.forEach(function (device) {
            DeviceRegistration.find({where: {deviceType: 'apns', deviceToken: device}}, function (err, results) {
                results.forEach(function (reg) {
                    reg.destroy();
                });
            });
        });
    });

    var apnConnection = new apn.Connection(pushOptions);
    apnConnection.on('error', function (err) {
        console.error(err);
    });

    var methods = {};

    /**
     * Push notification to a given device
     * @param deviceToken
     * @param notification
     */
    methods.pushNotification = function (deviceToken, notification) {
        apnConnection.pushNotification(notification, deviceToken);
    }

    /**
     * Push notification based the application
     * @param appId
     * @param appVersion
     * @param notification
     */
    methods.pushNotificationByApp = function (appId, appVersion, notification, cb) {
        DeviceRegistration.findByApp('apns', appId, appVersion, function (err, regs) {
            if (!err) {
                regs.forEach(function (r) {
                    apnConnection.pushNotification(notification, r.deviceToken);
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
    methods.pushNotificationByUser = function (userId, notification, cb) {
        DeviceRegistration.findByUser('apns', userId, function (err, regs) {
            if (!err) {
                regs.forEach(function (r) {
                    apnConnection.pushNotification(notification, r.deviceToken);
                });
                cb && cb(err, regs);
            } else {
                cb && cb(err, regs);
            }
        });
    }

    return methods;
}
