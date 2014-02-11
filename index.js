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
    installation: options.installation,
    application: options.application,
    notification: options.notification
  });

  var PushModel = pushDataSource.createModel(options.name || 'Push', {},
    {plural: options.plural || 'push'});
  return PushModel;
};

exports.Push = exports.createPushModel();
