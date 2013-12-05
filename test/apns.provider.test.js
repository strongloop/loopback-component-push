
var ApnsProvider = require('../lib/providers/apns');
var Notification = require('../models/notification');
var mockery = require('./helpers/mockery').apns;
var expect = require('chai').expect;
var sinon = require('sinon');

var aDeviceToken = 'a-device-token';

describe('APNS provider', function() {
  var provider;

  beforeEach(mockery.setUp);
  afterEach(mockery.tearDown);

  it('sends Notification as an APN message', function(done) {
    givenProviderWithConfig();

    var notification = aNotification({ aKey: 'a-value' });
    provider.pushNotification(notification, aDeviceToken);

    var apnArgs =  mockery.firstPushNotificationArgs();
    expect(apnArgs[0].payload).to.deep.equal({ aKey: 'a-value' });
    expect(apnArgs[1]).to.equal(aDeviceToken);
    done();
  });

  it('raises "device gone" event when feedback arrives', function(done) {
    givenProviderWithConfig({ apns: { feedbackOptions: {}}});
    var eventSpy = sinon.spy();
    provider.on('device gone', eventSpy);

    var devices = [aDeviceToken];
    mockery.emitFeedback(devices);

    expect(eventSpy.args[0]).to.deep.equal([devices]);
    done();
  });

  function givenProviderWithConfig(pushSettings) {
    provider = new ApnsProvider(pushSettings);
  }

  function aNotification(properties) {
    return new Notification(properties);
  }
});
