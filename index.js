var loopback = require('loopback');

/**
 * Create and configure the push notification model
 * @type {Function}
 * @param app {*} The loopback application instance
 * @param options {Object} The options
 */
exports = module.exports = function(app, options) {
    options = options || {};
    var Application = options.Application || loopback.Application;
    var DeviceRegistration = options.DeviceRegistration || require('./models/device-registration');
    var Notification = options.Notification || require('./models/notification');

    var dataSource = options.dataSource || loopback.createDataSource('dbForPushNotification', {connector: loopback.Memory});

    if(options.dataSource) {
        // Attach models to the dataSource from the options object
        Application.attachTo(dataSource);
        DeviceRegistration.attachTo(dataSource);
        Notification.attachTo(dataSource);
    }

    var pushDataSource = loopback.createDataSource({
        connector: require('./lib/push-connector'),
        DeviceRegistration: DeviceRegistration,
        Application: Application
    });

    var PushModel = pushDataSource.createModel('pushNotification');

    if(app) {
        app.model(DeviceRegistration);
        app.model(Notification);
        app.model(PushModel);
    }

    PushModel.Application = Application;
    PushModel.DeviceRegistration = DeviceRegistration;
    PushModel.Notification = Notification;

    return PushModel;
};
