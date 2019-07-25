// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

const SG = require('strong-globalize');
SG.SetRootDir(__dirname);

/**
 * Export the connector
 */
const loopback = require('loopback');
const PushConnector = require('./lib/push-connector');
exports = module.exports = PushConnector;

/**
 * Export two model classes as properties
 */
exports.Installation = require('./models').Installation;
exports.Notification = require('./models').Notification;

exports.createPushModel = function(options) {
  options = options || {};

  const pushDataSource = loopback.createDataSource({
    connector: PushConnector,
    installation: options.installation,
    application: options.application,
    notification: options.notification,
    ttlInSeconds: options.ttlInSeconds,
    checkPeriodInSeconds: options.checkPeriodInSeconds,
  });

  const PushModel = pushDataSource.createModel(options.name || 'Push', {},
    {plural: options.plural || 'push'});
  return PushModel;
};

exports.Push = exports.createPushModel();
