var loopback = require('loopback');
var PushManager = require('./push-manager');
/**
 * Export the initialize method to Loopback DataSource
 * @param dataSource
 * @param callback
 */
exports.initialize = function (dataSource, callback) {
    var settings = dataSource.settings || {};

    // Create an instance of the APNSManager
    var connector = new PushManager(settings);
    dataSource.connector = connector;
    dataSource.connector.dataSource = dataSource;

    connector.DataAccessObject = function() {};
    for (var m in PushManager.prototype) {
        var method = PushManager.prototype[m];
        if ('function' === typeof method) {
            connector.DataAccessObject[m] = method.bind(connector);
            for(var k in method) {
                connector.DataAccessObject[m][k] = method[k];
            }
        }
    }
};
