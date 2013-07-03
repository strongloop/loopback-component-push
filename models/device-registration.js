/**
 * Module Dependencies
 */

module.exports = function(db) {
    var config = require("./device-registration.json");

    /**
     * DeviceRegistration Model
     */
    var DeviceRegistration = module.exports = db.createModel(
        config.name,
        config.properties,
        config.options
    );

    /**
     * Find devices by application
     * @param appId
     * @param appVersion
     * @param deviceType
     * @param cb
     */
    DeviceRegistration.findByApp = function (deviceType, appId, appVersion, cb) {
        DeviceRegistration.find({where: {appId: appId, appVersion: appVersion, deviceType: deviceType}}, cb);
    }

    /**
     * Find devices by user
     * @param userId
     * @param deviceType
     * @param cb
     */
    DeviceRegistration.findByUser = function (deviceType, userId, cb) {
        DeviceRegistration.find({where: {userId: userId, deviceType: deviceType}}, cb);
    }

    return DeviceRegistration;
}



