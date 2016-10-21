// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var g = require('strong-globalize')();
var assert = require('assert');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('loopback:component:push:provider:apns');
var apn = require('apn');

/**
 * Provider used to distribute push notifications through Apple Push Notification Service.
 * @param pushSettings
 * @constructor
 */
function ApnsProvider(pushSettings) {
  pushSettings = pushSettings || {};

  var settings = pushSettings.apns || {};
  var pushOptions = settings.pushOptions || {};

  // is running sandbox / production
  pushOptions.production = settings.production;

  // validate required properties
  assert.notStrictEqual(typeof settings.token, 'undefined', 'JWT Token must be defined');
  assert.notStrictEqual(typeof settings.bundle, 'undefined', 'Bundle must be defined and should contain the bundle identifier of the app');

  // handle token & bundle configuration
  pushOptions.token = settings.token;
  pushOptions.bundle = settings.bundle;

  // Keep the options for testing verification
  this._pushOptions = pushOptions;
  this._connection = null;
}

inherits(ApnsProvider, EventEmitter);

exports = module.exports = ApnsProvider;

/**
 * Ensures that the push connection is created, if not done yet.
 * @param options
 * @returns {*}
 * @private
 */
ApnsProvider.prototype._ensurePushConnection = function(options) {
  var self = this;

  // already connection running, close
  if (self._connection != null) {
    debug('Connection already established, do not reconnect');
    return;
  }

  debug('setting up push connection', options);

  function errorHandler(err) {
    debug('Cannot initialize APNS connection. %s', err.stack);
    self.emit('error', err);
  }

  var connection;
  try {
    connection = new apn.Provider(options);
  } catch (e) {
    return errorHandler(e);
  }
  connection.on('error', errorHandler);
  connection.on('socketError', errorHandler);

  connection.on('transmissionError', function(code, notification, recipient) {
    var err = new Error(g.f('Cannot send {{APNS}} notification: %s', code));
    self.emit(err, notification, recipient);
  });

  self._connection = connection;
};

/***
 * Send push notification through APNs
 * @param notification
 * @param deviceToken
 */
ApnsProvider.prototype.pushNotification = function(notification, deviceToken) {
  var self = this,
      pushOptions = self._pushOptions;

  // node-apn has a bug rightnow.. after sending the first
  // batch of notifications, the connection goes away
  // so make sure we reconnect in those cases
  self._ensurePushConnection(pushOptions);

  // Note parameters are described here:
  //   http://bit.ly/apns-notification-payload
  var note = _createNotification(notification, pushOptions);

  debug('Pushing notification to %j:', deviceToken, note);

  this._connection.send(note, deviceToken).then(function(result){
    debug('Sent through APNs, got result', result);

    // we get immediate feedback from APNs
    // distribute to notify everybody that there are devices unreachable
    if (result.failed.length > 0){
      self.emit('devicesGone', _extractDeviceTokens(result.failed));
    }
  }, function(){
    debug('There was an error while sending', arguments);
  });
};

/**
 * Creates new apn notification object
 *
 * @param notification
 * @param pushOptions
 * @private
 */
function _createNotification(notification, pushOptions){
  var note = new apn.Notification();

  note.expiry = notification.getTimeToLiveInSecondsFromNow() || note.expiry;
  note.badge = notification.badge;
  note.sound = notification.sound;
  note.alert = notification.alert;
  note.category = notification.category;
  note.contentAvailable = notification.contentAvailable;
  note.urlArgs = notification.urlArgs;
  note.payload = {};

  // the topic is necessary to identify
  // the app which receives this notification
  note.topic = pushOptions.bundle;

  // custom stuff which will be added to the payload
  Object.keys(notification).forEach(function(key) {
    note.payload[key] = notification[key];
  });

  return note;
}

/**
 * Extract the plain tokens from a list of failed devices
 * @param failed
 * @private
 */
function _extractDeviceTokens(failed){
  var tokens = [];

  failed.forEach(function(device){
    var token = device.device;

    tokens.push(token);
  });

  return tokens;
}