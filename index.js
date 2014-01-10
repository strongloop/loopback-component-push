/**
 * Export the connector
 */
var PushConnector = require('./lib/push-connector');
exports = module.exports = PushConnector;

/**
 * Export two model classes as properties
 */
exports.Installation = require('./models/installation');
exports.Notification = require('./models/notification');

var loopback = require('loopback');

exports.createPushModel = function (options) {
  options = options || {};

  var pushDataSource = loopback.createDataSource({
    connector: PushConnector,
    installation: options.installation || 'Installation',
    application: options.application || 'Application',
    notification: options.notification || 'Notification'
  });

  var PushModel = pushDataSource.createModel('push', {}, {plural: 'push'});
  return PushModel;
};


