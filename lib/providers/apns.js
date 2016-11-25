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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 74e5fdd... enhance: make linter not fail
  if (typeof settings.production === 'undefined') {
    pushOptions.production = false;
  } else {
    pushOptions.production = settings.production;
  }
<<<<<<< HEAD

  // validate required properties
  var errors = {
    token: 'JWT Token must be defined, property "token" is undefined.',
    bundle: 'Bundle should contain the bundle identifier of the app',
=======
  pushOptions.production = settings.production;
>>>>>>> 5fa0430... enhance: Remove certificate based code

<<<<<<< HEAD
    keyId: 'Tokens property "keyId" must be set.',
    key: 'Tokens property "key" must be set.',
    teamId: 'Tokens property "teamId" must be set.',
  };

  var u = 'undefined';

  assert.notStrictEqual(typeof settings.token, u, errors.token);
  assert.notStrictEqual(typeof settings.bundle, u, errors.bundle);

  assert.notStrictEqual(typeof settings.token.keyId, u, errors.keyId);
  assert.notStrictEqual(typeof settings.token.key, u, errors.key);
  assert.notStrictEqual(typeof settings.token.teamId, u, errors.teamId);
=======
  pushOptions.production = typeof settings.production === 'undefined' ? false : settings.production;
>>>>>>> 5a7afc1... enhance: Add default value for production if not specified
=======
>>>>>>> 74e5fdd... enhance: make linter not fail

=======
  // validate required properties
  var errors = {
    token: 'JWT Token must be defined, property "token" is undefined.',
    bundle: 'Bundle should contain the bundle identifier of the app',

    keyId: 'Tokens property "keyId" must be set.',
    key: 'Tokens property "key" must be set.',
    teamId: 'Tokens property "teamId" must be set.',
  };

  var u = 'undefined';

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> e18dcc1... enhance: Use asserts to validate push settings
=======
  assert.notStrictEqual(typeof settings.token.keyId, 'undefined', 'Tokens property "keyId" must be set.');
  assert.notStrictEqual(typeof settings.token.key, 'undefined', 'Tokens property "key" must be set.');
  assert.notStrictEqual(typeof settings.token.teamId, 'undefined', 'Tokens property "teamId" must be set.');
=======
  assert.notStrictEqual(typeof settings.token, u, errors.token);
  assert.notStrictEqual(typeof settings.bundle, u, errors.bundle);

  assert.notStrictEqual(typeof settings.token.keyId, u, errors.keyId);
  assert.notStrictEqual(typeof settings.token.key, u, errors.key);
  assert.notStrictEqual(typeof settings.token.teamId, u, errors.teamId);
>>>>>>> 74e5fdd... enhance: make linter not fail

>>>>>>> c3875e6... add: Asserts for checking validity of token
  // handle token & bundle configuration
  pushOptions.token = settings.token;
  pushOptions.bundle = settings.bundle;

  // Keep the options for testing verification
  this._pushOptions = pushOptions;

  /**
   * the connection property
   * @type {null}
   * @private
   */
  var _connection = null;

  /**
   * Sets the stored connection
   * @param connect
   */
  this.setConnection = function(connect) {
    _connection = connect;
  };

  /**
   * Gets the stored connection or null
   * @returns {*}
   */
  this.getConnection = function() {
    return _connection;
  };

  /**
   * Retrieves whether is connected or not
   * @returns {boolean}
   */
  this.getConnected = function() {
    return _connection !== null;
  };

  debug('Initialize APNS');
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

  debug('Check whether connected', self.getConnected());

  // already connection running, close
  if (self.getConnected()) {
    debug('Connection already established, do not reconnect');
    return;
  }

  debug('setting up push connection', self.getConnected(), options);

  /**
   * Error handler for connection errors
   * @param err
   */
  function errorHandler(err) {
    debug('Cannot initialize APNS connection. %s', err.stack);
    self.emit('error', err);
  }

  /**
   * Error handler for transmission errors
   * @param code
   * @param notification
   * @param recipient
   */
  function transmissionErrorHandler(code, notification, recipient) {
    var err = new Error(g.f('Cannot send {{APNS}} notification: %s', code));
    self.emit(err, notification, recipient);
  }

  // try to connect & create the provider
  try {
    self.setConnection(new apn.Provider(options));

    debug('created connection', self.getConnected());
  } catch (e) {
    return errorHandler(e);
  }

  // handle errors, attach handlers to the events
  self.getConnection().on('error', errorHandler);
  self.getConnection().on('socketError', errorHandler);
  self.getConnection().on('transmissionError', transmissionErrorHandler);

  debug('is connected', self.getConnected());
};

/***
 * Send push notification through APNs
 * @param notification
 * @param deviceToken
 */
ApnsProvider.prototype.pushNotification = function(notification, deviceToken) {
<<<<<<< HEAD
<<<<<<< HEAD
  var self = this;
  var pushOptions = self._pushOptions;
=======
  var self = this,
      pushOptions = self._pushOptions;
>>>>>>> 468db74... enhance: Some small refactoring
=======
  var self = this;
  var pushOptions = self._pushOptions;
>>>>>>> 74e5fdd... enhance: make linter not fail

  // node-apn has a bug rightnow.. after sending the first
  // batch of notifications, the connection goes away
  // so make sure we reconnect in those cases
  self._ensurePushConnection(pushOptions);

  // Note parameters are described here:
  //   http://bit.ly/apns-notification-payload
<<<<<<< HEAD
<<<<<<< HEAD
  var note = _createNotification(notification, pushOptions);

  debug('Pushing notification to %j:', deviceToken, note);

  self.getConnection().send(note, deviceToken).then(function(result) {
=======
  var note = _createNotification(notification, self._pushOptions);
=======
  var note = _createNotification(notification, pushOptions);
>>>>>>> 468db74... enhance: Some small refactoring

  debug('Pushing notification to %j:', deviceToken, note);

<<<<<<< HEAD
<<<<<<< HEAD
  this._connection.send(note, deviceToken).then(function(result){
>>>>>>> ced581a... enhance: Extract notifcation creation into new function
=======
  this._connection.send(note, deviceToken).then(function(result) {
>>>>>>> 74e5fdd... enhance: make linter not fail
=======
  self.getConnection().send(note, deviceToken).then(function(result) {
>>>>>>> c19a0dc... fix: Error while resending the push notification on the same connection
    debug('Sent through APNs, got result', result);

    // we get immediate feedback from APNs
    // distribute to notify everybody that there are devices unreachable
<<<<<<< HEAD
<<<<<<< HEAD
    if (result.failed.length > 0) {
      self.emit('devicesGone', _extractDeviceTokens(result.failed));
    }
  }, function() {
=======
    if (result.failed.length > 0){
      self.emit('devicesGone', _extractDeviceTokens(result.failed));
    }
  }, function(){
>>>>>>> ced581a... enhance: Extract notifcation creation into new function
=======
    if (result.failed.length > 0) {
      self.emit('devicesGone', _extractDeviceTokens(result.failed));
    }
  }, function() {
>>>>>>> 74e5fdd... enhance: make linter not fail
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
<<<<<<< HEAD
<<<<<<< HEAD
function _createNotification(notification, pushOptions) {
=======
function _createNotification(notification, pushOptions){
>>>>>>> ced581a... enhance: Extract notifcation creation into new function
=======
function _createNotification(notification, pushOptions) {
>>>>>>> 74e5fdd... enhance: make linter not fail
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
<<<<<<< HEAD
=======

>>>>>>> ced581a... enhance: Extract notifcation creation into new function
  return note;
}

/**
 * Extract the plain tokens from a list of failed devices
 * @param failed
 * @private
 */
function _extractDeviceTokens(failed) {
  var tokens = [];

  failed.forEach(function(device) {
    var token = device.device;

    tokens.push(token);
  });

  return tokens;
}
