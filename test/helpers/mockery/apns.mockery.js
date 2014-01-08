
// This module provides a mocked environment where APN connections
// are calling callbacks provided by tests instead of communicating with
// the real service

var EventEmitter = require('events').EventEmitter;
var apn = require('apn');
var sinon = require('sinon');

var mockery = exports;

/**
 * The options passed to `apn.Connection` constructor.
 * The value is updated by every call of `apn.Connection()`
 */
mockery.connectionOptions = null;

/**
 * The spy installed instead of `apn.Connection.pushNotification`.
 * The value is initialized by `setup()`.
 */
mockery.pushNotification = null;

/**
 * The options passed to `apn.Feedback` constructor.
 * The value is updated by every call of the constructor.
 */
mockery.feedbackOptions = null;

/**
 * Function for emitting a fake "feedback" event.
 * It reports a warning when the feedback service was not configured
 * byt the subject under test.
 */
mockery.emitFeedback = function(devices) {
  console.error('Warning: cannot emit fake feedback, as the feedback' +
    ' service was not configured by the subject under test.');
};

/**
 * Shorthand for `pushNotification.firstCall.args`
 * @returns {Array.<Object>}
 */
mockery.firstPushNotificationArgs = function() {
  return mockery.pushNotification.firstCall.args;
};


var apnsSnapshot = {};
var defaultExports = {};

/**
 * Setup the mockery. This method should be called before each test.
 */
exports.setUp = function() {
  var key;
  for (key in apn) {
    apnsSnapshot[key] = apn[key];
  }

  for (key in exports) {
    defaultExports[key] = exports[key];
  }

  mockery.pushNotification = sinon.spy();

  apn.Connection = apn.connection = function(opts) {
    mockery.connectionOptions = opts;
    var conn = new EventEmitter();
    conn.pushNotification = mockery.pushNotification;
    return conn;
  };

  apn.Feedback = apn.feedback = function(opts) {
    mockery.feedbackOptions = opts;
    var feedback = new EventEmitter();
    mockery.emitFeedback = function(devices) {
      if (!(devices instanceof Array)) devices = [devices];
      feedback.emit('feedback', devices);
    };
    return feedback;
  };
};

/**
 * Restore the application state as it was before mockery setup.
 * This method should be called after each test.
 */
exports.tearDown = function() {
  var key;

  for (key in apnsSnapshot) {
    apn[key] = apnsSnapshot[key];
  }
  for (key in defaultExports) {
    exports[key] = defaultExports[key];
  }
};
