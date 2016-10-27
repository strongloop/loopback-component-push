// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

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
mockery.send = null;

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
  return mockery.send.firstCall.args;
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

  var expectedResponse = {
    failed: [
      {
<<<<<<< HEAD
<<<<<<< HEAD
        device: 'some_failing_device_token',
      },
    ],
  };

  mockery.send = sinon.spy(function() {
=======
        device: 'some_failing_device_token'
      }
    ]
  };

  mockery.send = sinon.spy(function(){
>>>>>>> 07d0cd0... enhance: Make some unit tests work
=======
        device: 'some_failing_device_token',
      },
    ],
  };

  mockery.send = sinon.spy(function() {
>>>>>>> 74e5fdd... enhance: make linter not fail
    return Promise.resolve(expectedResponse);
  });

  apn.Provider = apn.provider = function(opts) {
    mockery.connectionOptions = opts;
    var conn = new EventEmitter();
    conn.send = mockery.send;
    return conn;
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
