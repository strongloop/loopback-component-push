// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var extend = require('util')._extend;
var GcmProvider = require('../lib/providers/gcm');
var mockery = require('./helpers/mockery').gcm;
var objectMother = require('./helpers/object-mother');

var aDeviceToken = 'a-device-token';
var aDeviceTokenList = [
  'first-device-token',
  'second-device-token',
  'third-device-token',
  'fourth-device-token',
  'fifth-device-token',
];

describe('GCM provider', function() {
  var provider;

  beforeEach(mockery.setUp);
  beforeEach(setUpFakeTimers);
  beforeEach(function() { givenProviderWithConfig(); });

  afterEach(tearDownFakeTimers);
  afterEach(mockery.tearDown);

  describe('for single device token', function() {
    it('sends Notification as a GCM message', function(done) {
      var notification = aNotification({aKey: 'a-value'});
      notification.alert = 'alert message';
      notification.badge = 1;
      provider.pushNotification(notification, aDeviceToken);

      var gcmArgs = mockery.firstPushNotificationArgs();

      var msg = gcmArgs[0];
      expect(msg.params.collapseKey, 'collapseKey').to
        .equal(undefined);
      expect(msg.params.delayWhileIdle, 'delayWhileIdle').to.equal(undefined);
      expect(msg.params.timeToLive, 'timeToLive').to.equal(undefined);
      expect(msg.params.data, 'data').to
        .deep.equal({aKey: 'a-value', alert: 'alert message', badge: 1});

      expect(gcmArgs[1]).to.deep.equal([aDeviceToken]);
      done();
    });

    it('emits "error" when GCM send fails', function() {
      var anError = new Error('test-error');
      mockery.givenPushNotificationFailsWith(anError);

      var eventSpy = spyOnProviderError();

      provider.pushNotification(aNotification(), aDeviceToken);

      expect(eventSpy.calledOnce, 'error should be emitted once').to
        .equal(true);
      expect(eventSpy.args[0]).to.deep.equal([anError]);
    });

    it('emits "error" event when GCM returns error result', function() {
      // This is a real result returned by GCM
      var errorResult = aGcmResult([{'error': 'MismatchSenderId'}]);

      mockery.pushNotificationCallbackArgs = [null, errorResult];

      var eventSpy = spyOnProviderError();

      provider.pushNotification(aNotification(), aDeviceToken);

      expect(eventSpy.calledOnce, 'error should be emitted once').to
        .equal(true);
      expect(eventSpy.firstCall.args[0].message).to.contain('MismatchSenderId');
    });

    it('emits "devicesGone" when GCM returns NotRegistered', function(done) {
      var errorResult = aGcmResult([{'error': 'NotRegistered'}]);

      mockery.pushNotificationCallbackArgs = [null, errorResult];

      var eventSpy = sinon.spy();
      provider.on('devicesGone', eventSpy);
      provider.on('error', function(err) { throw err; });

      provider.pushNotification(aNotification(), aDeviceToken);

      var expectedIds = [aDeviceToken];
      expect(eventSpy.args[0]).to.deep.equal([expectedIds]);
      done();
    });
  });

  describe('for multiple device tokens', function() {
    it('sends Notification as a GCM message', function(done) {
      var notification = aNotification({aKey: 'a-value'});
      provider.pushNotification(notification, aDeviceTokenList);

      var gcmArgs = mockery.pushNotification.args[0];

      var msg = gcmArgs[0];
      expect(msg.params.collapseKey, 'collapseKey').to.equal(undefined);
      expect(msg.params.delayWhileIdle, 'delayWhileIdle').to.equal(undefined);
      expect(msg.params.timeToLive, 'timeToLive').to.equal(undefined);
      expect(msg.params.data, 'data').to.deep.equal({aKey: 'a-value'});

      expect(gcmArgs[1]).to.deep.equal(aDeviceTokenList);
      done();
    });

    it('handles GCM response for multiple device tokens', function(done) {
      var gcmError = new Error('GCM error code: MismatchSenderId, ' +
          'deviceToken: third-device-token\nGCM error code: ' +
          'MismatchSenderId, deviceToken: fifth-device-token');

      var gcmResult = aGcmResult([
        {'error': 'InvalidRegistration'},
        {'message_id': '1234567890'},
        {'error': 'MismatchSenderId'},
        {'error': 'NotRegistered'},
        {'error': 'MismatchSenderId'},
      ]);

      mockery.pushNotificationCallbackArgs = [null, gcmResult];

      var eventSpy = sinon.spy();
      provider.on('devicesGone', eventSpy);
      provider.on('error', function(err) {
        expect(err.message).to.equal(gcmError.message);
      });

      provider.pushNotification(aNotification(), aDeviceTokenList);

      var expectedIds = [aDeviceTokenList[0], aDeviceTokenList[3]];
      expect(eventSpy.calledOnce, 'error should be emitted once').to
        .equal(true);
      expect(eventSpy.args[0][0]).to.deep.equal(expectedIds);
      done();
    });
  });

  it('converts expirationInterval to GCM timeToLive', function() {
    var notification = aNotification({expirationInterval: 1});
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.params.timeToLive).to.equal(1);
  });

  it('converts expirationTime to GCM timeToLive relative to now', function() {
    var notification = aNotification({
      expirationTime: new Date(this.clock.now + 1000 /* 1 second */),
    });
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.params.timeToLive).to.equal(1);
  });

  it('forwards android parameters', function() {
    var notification = aNotification({
      collapseKey: 'a-collapse-key',
      delayWhileIdle: true,
    });

    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.params.collapseKey).to.equal('a-collapse-key');
    expect(message.params.delayWhileIdle, 'delayWhileIdle').to.equal(true);
  });

  it('ignores Notification properties not applicable', function() {
    var notification = aNotification(objectMother.allNotificationProperties());
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.params.data).to
      .deep.equal({alert: 'an-alert', badge: 1230001});
  });

  it('ignores Notification properties null or undefined', function() {
    var notification = aNotification({
      aFalse: false,
      aTrue: true,
      aNull: null,
      anUndefined: undefined,
    });
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.params.data).to.deep.equal({aFalse: false, aTrue: true});
  });

  function givenProviderWithConfig(pushSettings) {
    pushSettings = extend({}, pushSettings);
    pushSettings.gcm = extend({}, pushSettings.gcm);
    pushSettings.gcm.pushOptions = extend(
      {serverKey: 'a-test-server-key'},
      pushSettings.gcm.pushOptions);

    provider = new GcmProvider(pushSettings);
  }

  function aNotification(properties) {
    return new Notification(properties);
  }

  function aGcmResult(results) {
    var success = results.filter(function(item) {
      return item.message_id;
    }).length;

    var failure = results.filter(function(item) {
      return item.error;
    }).length;

    return {
      'multicast_id': 5504081219335647631,
      'success': success,
      'failure': failure,
      'canonical_ids': 0,
      'results': results,
    };
  }

  function setUpFakeTimers() {
    this.clock = sinon.useFakeTimers(Date.now());
  }

  function tearDownFakeTimers() {
    this.clock.restore();
  }

  function spyOnProviderError() {
    var eventSpy = sinon.spy();
    provider.on('error', eventSpy);
    return eventSpy;
  }
});
