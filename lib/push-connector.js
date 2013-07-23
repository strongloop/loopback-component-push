var loopback = require('loopback');
var PushService = require('./index');
/**
 * Export the initialize method to Loopback DataSource
 * @param dataSource
 * @param callback
 */
exports.initialize = function (dataSource, callback) {
    var settings = dataSource.settings || {};

    // Create the data source for push service
    if(settings.dataSource && settings.dataSource.constructor === Object) {
        console.log(settings.dataSource);
        settings.dataSource = loopback.createDataSource(settings.dataSource);
    }

    // Create an instance of the PushService
    var connector = new PushService(settings);
    dataSource.connector = connector;
    dataSource.connector.dataSource = dataSource;

    connector.DataAccessObject = function() {};
    for (var m in PushService.prototype) {
        var method = PushService.prototype[m];
        if ('function' === typeof method) {
            connector.DataAccessObject[m] = method.bind(connector);
            for(var k in method) {
                connector.DataAccessObject[m][k] = method[k];
            }
        }
    }

    // We don't care about the models
    connector.define = function(model, properties, settings) {};
}
