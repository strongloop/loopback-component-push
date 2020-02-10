// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

// This module provides a mocked environment where APN connections
// are calling callbacks provided by tests instead of communicating with
// the real service

const EventEmitter = require('events').EventEmitter;
const apn = require('apn');
const sinon = require('sinon');

const mockery = exports;

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
  return mockery.send.firstCall.args;
};

const apnsSnapshot = {};
const defaultExports = {};

/**
 * Setup the mockery. This method should be called before each test.
 */
exports.setUp = function() {
  let key;
  for (key in apn) {
    apnsSnapshot[key] = apn[key];
  }

  for (key in exports) {
    defaultExports[key] = exports[key];
  }

  const expectedResponse = {
    failed: [
      {
        device: 'some_failing_device_token',
      },
    ],
  };

  mockery.send = sinon.spy(function() {
    return Promise.resolve(expectedResponse);
  });

  apn.Provider = apn.provider = function(opts) {
    mockery.connectionOptions = opts;

    const conn = new EventEmitter();
    conn.send = mockery.send;

    return conn;
  };
};

/**
 * Restore the application state as it was before mockery setup.
 * This method should be called after each test.
 */
exports.tearDown = function() {
  let key;

  for (key in apnsSnapshot) {
    apn[key] = apnsSnapshot[key];
  }
  for (key in defaultExports) {
    exports[key] = defaultExports[key];
  }
};
