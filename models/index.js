// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

// mostly borrowed from
// https://github.com/strongloop/loopback-component-passport/blob/master/lib/index.js
const loopback = require('loopback');
const DataModel = loopback.PersistedModel || loopback.DataModel;

function loadModel(jsonFile) {
  const modelDefinition = require(jsonFile);
  return DataModel.extend(modelDefinition.name, modelDefinition.properties);
}

const InstallationModel = loadModel('./installation.json');
const NotificationModel = loadModel('./notification.json');

/**
 * Export two model classes as properties
 */
exports.Installation = require('./installation')(InstallationModel);
exports.Notification = require('./notification')(NotificationModel);

exports.Installation.autoAttach = 'db';
exports.Notification.autoAttach = 'db';
