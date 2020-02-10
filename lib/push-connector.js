// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

const loopback = require('loopback');
const PushManager = require('./push-manager');
/**
 * Export the initialize method to Loopback DataSource
 * @param {Object} dataSource Loopback dataSource (Memory, etc).
 * @param {Function} callback (unused)
 */
exports.initialize = function(dataSource, callback) {
  const settings = dataSource.settings || {};

  // Create an instance of the APNSManager
  const connector = new PushManager(settings);
  dataSource.connector = connector;
  dataSource.connector.dataSource = dataSource;

  connector.DataAccessObject = function() {};
  for (const m in PushManager.prototype) {
    const method = PushManager.prototype[m];
    if ('function' === typeof method) {
      connector.DataAccessObject[m] = method.bind(connector);
      for (const k in method) {
        connector.DataAccessObject[m][k] = method[k];
      }
    }
  }
};
