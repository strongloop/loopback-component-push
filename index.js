// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var SG = require('strong-globalize');
SG.SetRootDir(__dirname);

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

exports.createPushModel = function(options) {
  options = options || {};

  var pushDataSource = loopback.createDataSource({
    connector: PushConnector,
    installation: options.installation,
    application: options.application,
    notification: options.notification,
    ttlInSeconds: options.ttlInSeconds,
    checkPeriodInSeconds: options.checkPeriodInSeconds,
  });

  var PushModel = pushDataSource.createModel(options.name || 'Push', {},
    {plural: options.plural || 'push'});
  return PushModel;
};

exports.Push = exports.createPushModel();
