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
    var Device = options.Device || require('./models/device');
    var Notification = options.Notification || require('./models/notification');

    var dataSource = options.dataSource || loopback.createDataSource('dbForPushNotification', {connector: loopback.Memory});

    if(options.dataSource) {
        // Attach models to the dataSource from the options object
        Application.attachTo(dataSource);
        Device.attachTo(dataSource);
        Notification.attachTo(dataSource);
    }

    var pushDataSource = loopback.createDataSource({
        connector: require('./lib/push-connector'),
        Device: Device,
        Application: Application
    });

    var PushModel = pushDataSource.createModel('pushNotification');

    if(app) {
        app.model(Device);
        app.model(Notification);
        app.model(PushModel);
    }

    PushModel.Application = Application;
    PushModel.Device = Device;
    PushModel.Notification = Notification;

    return PushModel;
};
