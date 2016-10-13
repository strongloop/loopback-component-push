// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

// This module provides a mocked environment where APN/GCM/etc. connections
// are calling callbacks provided by tests instead of communicating with
// the real service

/**
 * APNS mocks, initialized by setUp().
 */
exports.apns = require('./apns.mockery.js');

/**
 * GCM mocks, initialized by setUp();
 */
exports.gcm = require('./gcm.mockery.js');

/**
 * Stub provider, independent on any real implementation.
 *
 * Note: this provider is not setUp by default, you have
 * to call setUp()/tearDown() yourself.
 */
exports.stub = require('./stub.mockery.js');

/**
 * Setup the mockery. This method should be called before each test.
 */
exports.setUp = function() {
  exports.apns.setUp();
  exports.gcm.setUp();
};

/**
 * Restore the application state as it was before mockery setup.
 * This method should be called after each test.
 */
exports.tearDown = function() {
  exports.apns.tearDown();
  exports.gcm.tearDown();
};

