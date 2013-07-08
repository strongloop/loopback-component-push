var asteroid = require('asteroid');
var PushService = require('./index');
/**
 * Export the initialize method to JDB
 * @param schema
 * @param callback
 */
exports.initialize = function (schema, callback) {
    var settings = schema.settings || {};

    // Create the data source for push service
    if(settings.dataSource && settings.dataSource.constructor === Object) {
        console.log(settings.dataSource);
        settings.dataSource = asteroid.createDataSource(settings.dataSource);
    }

    // Create an instance of the PushService
    var adapter = new PushService(settings);
    schema.adapter = adapter;
    schema.adapter.schema = schema;

    adapter.DataAccessObject = function() {};
    for (var m in PushService.prototype) {
        var method = PushService.prototype[m];
        if ('function' === typeof method) {
            adapter.DataAccessObject[m] = method.bind(adapter);
            for(var k in method) {
                adapter.DataAccessObject[m][k] = method[k];
            }
        }
    }

    // We don't care about the models
    adapter.define = function(model, properties, settings) {};
}
