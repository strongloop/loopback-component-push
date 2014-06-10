
var extend = require('util')._extend;
var GcmProvider = require('../lib/providers/gcm');
var Notification = require('../models/notification');
var mockery = require('./helpers/mockery').gcm;
var objectMother = require('./helpers/object-mother');
var expect = require('chai').expect;
var sinon = require('sinon');

var aDeviceToken = 'a-device-token';

describe('GCM provider', function() {
  var provider;

  beforeEach(mockery.setUp);
  beforeEach(setUpFakeTimers);
  beforeEach(function() { givenProviderWithConfig(); });

  afterEach(tearDownFakeTimers);
  afterEach(mockery.tearDown);

  it('sends Notification as a GCM message', function(done) {
    var notification = aNotification({ aKey: 'a-value' });
    provider.pushNotification(notification, aDeviceToken);

    var gcmArgs = mockery.firstPushNotificationArgs();

    var msg = gcmArgs[0];
    expect(msg.collapseKey, 'collapseKey').to.equal(undefined);
    expect(msg.delayWhileIdle, 'delayWhileIdle').to.equal(undefined);
    expect(msg.timeToLive, 'timeToLive').to.equal(undefined);
    expect(msg.collapseKey, 'collapseKey').to.equal(undefined);
    expect(msg.delayWhileIdle, 'delayWhileIdle').to.equal(undefined);
    expect(msg.data, 'data').to.deep.equal({ aKey: 'a-value' });

    expect(gcmArgs[1]).to.deep.equal([aDeviceToken]);
    done();
  });

  // TODO(bajtos) - NotRegistered and InvalidRegistration errors should
  // emit "device gone" event

  it('converts expirationInterval to GCM timeToLive', function() {
    var notification = aNotification({ expirationInterval: 1 /* second */});
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.timeToLive).to.equal(1);
  });

  it('converts expirationTime to GCM timeToLive relative to now', function() {
    var notification = aNotification({
      expirationTime: new Date(this.clock.now + 1000 /* 1 second */)
    });
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.timeToLive).to.equal(1);
  });

  it('forwards android parameters', function() {
    var notification = aNotification({
      collapseKey: 'a-collapse-key',
      delayWhileIdle: true
    });

    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.collapseKey).to.equal('a-collapse-key');
    expect(message.delayWhileIdle, 'delayWhileIdle').to.equal(true);
  });

  it('ignores Notification properties not applicable', function() {
    var notification = aNotification(objectMother.allNotificationProperties());
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.data).to.eql({ });
  });

  it('emits "error" when GCM send fails', function() {
    var anError = new Error('test-error');
    mockery.givenPushNotificationFailsWith(anError);

    var eventSpy = spyOnProviderError();

    provider.pushNotification(aNotification(), aDeviceToken);

    expect(eventSpy.calledOnce, 'error should be emitted once').to.equal(true);
    expect(eventSpy.args[0]).to.deep.equal([anError]);
  });

  it('emits "error" event when GCM returns error result', function() {
    // This is a real result returned by GCM
    var errorResult = {
      'multicast_id': 5504081219335647631,
      'success': 0,
      'failure': 1,
      'canonical_ids': 0,
      'results': [{ 'error': 'MismatchSenderId' }]
    };

    mockery.pushNotificationCallbackArgs = [null, errorResult];

    var eventSpy = spyOnProviderError();

    provider.pushNotification(aNotification(), aDeviceToken);

    expect(eventSpy.calledOnce, 'error should be emitted once').to.equal(true);
    expect(eventSpy.firstCall.args[0].message).to.contain('MismatchSenderId');
  });

  it('emits "devicesGone" when GCM returns NotRegistered', function(done) {
    var errorResult = {
      'multicast_id': 5504081219335647631,
      'success': 0,
      'failure': 1,
      'canonical_ids': 0,
      'results': [{ 'error': 'NotRegistered' }]
    };
    mockery.pushNotificationCallbackArgs = [null, errorResult];

    var eventSpy = sinon.spy();
    provider.on('devicesGone', eventSpy);
    provider.on('error', function(err) { throw err; });

    provider.pushNotification(aNotification(), aDeviceToken);

    var expectedIds = [aDeviceToken];
    expect(eventSpy.args[0]).to.deep.equal([expectedIds]);
    done();
  });

  function givenProviderWithConfig(pushSettings) {
    pushSettings = extend({}, pushSettings);
    pushSettings.gcm = extend({}, pushSettings.gcm);
    pushSettings.gcm.pushOptions = extend(
      { serverKey: 'a-test-server-key' },
      pushSettings.gcm.pushOptions);

    provider = new GcmProvider(pushSettings);
  }

  function aNotification(properties) {
    return new Notification(properties);
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
