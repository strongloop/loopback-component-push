
var extend = require('util')._extend;
var GcmProvider = require('../lib/providers/gcm');
var Notification = require('../models/notification');
var mockery = require('./helpers/mockery').gcm;
var expect = require('chai').expect;
var sinon = require('sinon');

var aDeviceToken = 'a-device-token';

describe('GCM provider', function() {
  var provider;

  beforeEach(mockery.setUp);
  afterEach(mockery.tearDown);

  it('sends Notification as a GCM message', function(done) {
    givenProviderWithConfig();

    var notification = aNotification({ aKey: 'a-value' });
    provider.pushNotification(notification, aDeviceToken);

    var gcmArgs =  mockery.firstPushNotificationArgs();
    expect(gcmArgs[0].data).to.deep.equal({ aKey: 'a-value' });
    expect(gcmArgs[1]).to.deep.equal([aDeviceToken]);
    done();
  });

  // TODO(bajtos) - NotRegistered and InvalidRegistration errors should
  // emit "device gone" event

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
});
