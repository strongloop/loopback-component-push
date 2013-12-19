
// This module provides a mocked environment where GCM connections
// are calling callbacks provided by tests instead of communicating with
// the real service

var EventEmitter = require('events').EventEmitter;
var gcm = require('node-gcm');
var sinon = require('sinon');

var mockery = exports;

/**
 * The options passed to `gcm.Sender` constructor.
 * The value is updated by every call of the constructor.
 * @type Array.<Object>
 */
mockery.senderOptions = null;

/**
 * The spy installed instead of `gcm.Sender.send`.
 * The value is initialized by `setup()`.
 */
mockery.pushNotification = null;

/**
 * Shorthand for `pushNotification.firstCall.args`
 * @returns {Array.<Object>}
 */
mockery.firstPushNotificationArgs = function() {
  return mockery.pushNotification.firstCall.args;
};

/**
 * The arguments passed to pushNotification callback.
 * Modify this value in the test to simulate errors.
 */
mockery.pushNotificationCallbackArgs = [];

/**
 * Setup GCM send to always return the given error.
 * @param err
 */
mockery.givenPushNotificationFailsWith = function(err) {
  mockery.pushNotificationCallbackArgs = [err];
};

var gcmSnapshot = {};
var defaultExports = {};

/**
 * Setup the mockery. This method should be called before each test.
 */
exports.setUp = function() {
  var key;
  for (key in gcm) {
    gcmSnapshot[key] = gcm[key];
  }

  for (key in exports) {
    defaultExports[key] = exports[key];
  }

  mockery.pushNotification = sinon.spy();
  mockery.pushNotificationCallbackArgs = [null, { success: 1, failure: 0 }];

  gcm.Sender = function(opts) {
    mockery.senderOptions = Array.prototype.slice.call(arguments);
    var sender = {};
    sender.send = function(message, registrationId, retries, callback) {
      mockery.pushNotification.apply(this, arguments);
      callback.apply(null, mockery.pushNotificationCallbackArgs);
    };
    return sender;
  };
};

/**
 * Restore the application state as it was before mockery setup.
 * This method should be called after each test.
 */
exports.tearDown = function() {
  var key;

  for (key in gcmSnapshot) {
    gcm[key] = gcmSnapshot[key];
  }
  for (key in defaultExports) {
    exports[key] = defaultExports[key];
  }
};
