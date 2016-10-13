// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

// mostly borrowed from
// https://github.com/strongloop/loopback-component-passport/blob/master/lib/index.js
var loopback = require('loopback');
var DataModel = loopback.PersistedModel || loopback.DataModel;

function loadModel(jsonFile) {
  var modelDefinition = require(jsonFile);
  return DataModel.extend(modelDefinition.name, modelDefinition.properties);
}

var InstallationModel = loadModel('./installation.json');
var NotificationModel = loadModel('./notification.json');

/**
 * Export two model classes as properties
 */
exports.Installation = require('./installation')(InstallationModel);
exports.Notification = require('./notification')(NotificationModel);

exports.Installation.autoAttach = 'db';
exports.Notification.autoAttach = 'db';
