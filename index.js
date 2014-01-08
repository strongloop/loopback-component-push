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
    var Installation = options.Installation || require('./models/installation');
    var Notification = options.Notification || require('./models/notification');

    var dataSource = options.dataSource ||
      loopback.createDataSource('dbForPushNotification',
        {connector: loopback.Memory});

    if(options.dataSource) {
        // Attach models to the dataSource from the options object
        Application.attachTo(dataSource);
        Installation.attachTo(dataSource);
        Notification.attachTo(dataSource);
    }

    var pushDataSource = loopback.createDataSource({
        connector: require('./lib/push-connector'),
        Device: Installation,
        Application: Application
    });

    var PushModel = pushDataSource.createModel('push', {}, {plural: 'push'});

    if(app) {
        app.model(Installation);
        app.model(Notification);
        app.model(PushModel);
    }

    PushModel.Application = Application;
    PushModel.Installation = Installation;
    PushModel.Notification = Notification;

    return PushModel;
};
