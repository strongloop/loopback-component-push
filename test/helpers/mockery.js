/* Copyright (c) 2013 StrongLoop, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var apn = require('apn');
var EventEmitter = require('events').EventEmitter;

var sinon = require('sinon');

// This module provides a mocked environment where APN/GCM/etc. connections
// are calling callbacks provided by tests instead of communicating with
// the real service

/**
 * APN mocks
 * @type {{}}
 */
exports.apn = {
  /**
   * The spy installed instead of `apn.Connection.pushNotification`.
   * The value is initialized by `setup()`.
   */
  pushNotification: null,

  /**
   * The options passed to apn.Connection constructor.
   * The value is updated by every call of `apn.Connection()`
   */
  connectionOptions: null,

  /**
   * Shorthand for `pushNotification.firstCall.args`
   * @returns {Array.<Object>}
   */
  firstPushNotificationArgs: function() {
    return this.pushNotification.firstCall.args
  }
};

var originals;

/**
 * Setup the mockery. This method should be called before each test.
 * @param done callback
 */
exports.setup = function(done) {
  originals = {
    apn: {}
  };

  for (var key in apn) {
    originals[key] = apn[key];
  }

  setupApnMock();

  done();
};

function setupApnMock() {
  exports.apn.pushNotification = sinon.spy();

  apn.Connection = apn.connection = function(opts) {
    exports.apn.connectionOptions = opts;
    var conn = new EventEmitter();
    conn.pushNotification = exports.apn.pushNotification;
    return conn;
  };
}

/**
 * Restore the application state as it was before mockery setup.
 * This method should be called after each test.
 * @param done
 */
exports.teardown = function(done) {
  for (var key in originals.apn) {
    apn[key] = originals[key];
  }
  done();
};

