
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

  afterEach(tearDownFakeTimers);
  afterEach(mockery.tearDown);

  it('sends Notification as a GCM message', function(done) {
    givenProviderWithConfig();

    var notification = aNotification({ aKey: 'a-value' });
    provider.pushNotification(notification, aDeviceToken);

    var gcmArgs = mockery.firstPushNotificationArgs();

    var msg = gcmArgs[0];
    expect(msg.collapseKey, 'collapseKey').to.equal(undefined);
    expect(msg.delayWhileIdle, 'delayWhileIdle').to.equal(undefined);
    expect(msg.timeToLive, 'timeToLive').to.equal(undefined);
    expect(msg.data, 'data').to.deep.equal({ aKey: 'a-value' });

    expect(gcmArgs[1]).to.deep.equal([aDeviceToken]);
    done();
  });

  // TODO(bajtos) - NotRegistered and InvalidRegistration errors should
  // emit "device gone" event

  it('converts expirationInterval to GCM timeToLive', function() {
    givenProviderWithConfig();

    var notification = aNotification({ expirationInterval: 1 /* second */});
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.timeToLive).to.equal(1);
  });

  it('converts expirationTime to GCM timeToLive relative to now', function() {
    givenProviderWithConfig();

    var notification = aNotification({
      expirationTime: new Date(this.clock.now + 1000 /* 1 second */)
    });
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.timeToLive).to.equal(1);
  });

  it('ignores Notification properties not applicable', function() {
    givenProviderWithConfig();

    var notification = aNotification(objectMother.allNotificationProperties());
    provider.pushNotification(notification, aDeviceToken);

    var message = mockery.firstPushNotificationArgs()[0];
    expect(message.data).to.eql({ });
  });

  // TODO test conversion of collapseKey, delayWhileIdle

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
});
