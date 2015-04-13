/**
 * Export the connector
 */
var loopback = require('loopback');
var PushConnector = require('./lib/push-connector');
exports = module.exports = PushConnector;

/**
 * Export two model classes as properties
 */
exports.Installation = require('./models').Installation;
exports.Notification = require('./models').Notification;

exports.createPushModel = function (options) {
  options = options || {};

  var pushDataSource = loopback.createDataSource({
    connector: PushConnector,
    installation: options.installation,
    application: options.application,
    notification: options.notification,
    ttlInSeconds: options.ttlInSeconds,
    checkPeriodInSeconds: options.checkPeriodInSeconds
  });

  var PushModel = pushDataSource.createModel(options.name || 'Push', {},
    {plural: options.plural || 'push'});
  return PushModel;
};

exports.Push = exports.createPushModel();
