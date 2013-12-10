
// This module provides a mocked environment with a special "stub"
// provider that does not depend on any real implementation (GCM, APNS)

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var expect = require('chai').expect;
var sinon = require('sinon');
var PushManager = require('../../../lib/push-manager');

var mockery = exports;

/**
 * The device type used for registration with PushManager.
 */
mockery.deviceType = 'stub';

/**
 * The options passed to provider's constructor.
 * The value is updated by every call of the constructor.
 * @type Array.<Object>
 */
mockery.constructorArguments = null;

/**
 * The spy installed as `Provider.prototype.pushNotification()`
 * The value is initialized by `setup()`.
 */
mockery.pushNotification = null;

/**
 * Shorthand for `pushNotification.firstCall.args`
 * @returns {Array.<Object>}
 */
mockery.firstPushNotificationArgs = function() {
  expect(
    mockery.pushNotification.calledOnce,
    'pushNotificationArgs called at least once'
  ).to.equal(true);
  return mockery.pushNotification.firstCall.args;
};

/**
 * The arguments passed to pushNotification callback.
 * Modify this value in the test to simulate errors.
 */
mockery.pushNotificationCallbackArgs = [];
/**
 * Function for emitting "devicesGone" event.
 * It reports a warning when the Provider was not
 * by the subject under test.
 * @param devices {Array.<Object>|Object}
 */
mockery.emitDevicesGone = function(devices) {
  console.error('Warning: cannot emit devicesGone, as the provider' +
    ' was not configured by the subject under test.');
};

function StubProvider(options) {
  EventEmitter.call(this);
  mockery.constructorArguments = options;
  mockery.emitDevicesGone = this.emitDevicesGone.bind(this);
}

inherits(StubProvider, EventEmitter);

StubProvider.prototype.pushNotification = function(notification, deviceToken) {
  mockery.pushNotification.call(this, notification, deviceToken);
};

StubProvider.prototype.emitDevicesGone = function(devices) {
  if (!(devices instanceof Array)) devices = [devices];
  this.emit('devicesGone', devices);
};


var defaultExports = {};

/**
 * Setup the mockery. This method should be called before each test.
 */
exports.setUp = function() {
  for (var key in exports) {
    defaultExports[key] = exports[key];
  }

  mockery.pushNotification = sinon.spy();
  PushManager.providers[exports.deviceType] = StubProvider;
};

/**
 * Restore the application state as it was before mockery setup.
 * This method should be called after each test.
 */
exports.tearDown = function() {
  for (var key in defaultExports) {
    exports[key] = defaultExports[key];
  }

  delete PushManager.providers[exports.deviceType];
};
