
var fs = require('fs');
var path = require('path');
var ApnsProvider = require('../lib/providers/apns');
var Notification = require('../models/notification');
var mockery = require('./helpers/mockery').apns;
var objectMother = require('./helpers/object-mother');
var expect = require('chai').expect;
var sinon = require('sinon');

var aDeviceToken = 'a-device-token';

describe('APNS provider', function() {
  var provider;

  describe('in sandbox', function() {
    beforeEach(mockery.setUp);
    beforeEach(setUpFakeTimers);

    afterEach(tearDownFakeTimers);
    afterEach(mockery.tearDown);

    it('sends Notification as an APN message', function(done) {
      givenProviderWithConfig();

      var notification = aNotification({ aKey: 'a-value' });
      provider.pushNotification(notification, aDeviceToken);

      var apnArgs =  mockery.firstPushNotificationArgs();

      var note = apnArgs[0];
      expect(note.expiry, 'expiry').to.equal(0);
      expect(note.alert, 'alert').to.equal(undefined);
      expect(note.badge, 'badge').to.equal(undefined);
      expect(note.sound, 'sound').to.equal(undefined);
      expect(note.payload, 'payload').to.deep.equal({ aKey: 'a-value' });

      expect(apnArgs[1]).to.equal(aDeviceToken);
      done();
    });

    it('raises "devicesGone" event when feedback arrives', function(done) {
      givenProviderWithConfig({ apns: { feedbackOptions: {}}});
      var eventSpy = sinon.spy();
      provider.on('devicesGone', eventSpy);

      var devices = [aDeviceToken];
      mockery.emitFeedback(devices);

      expect(eventSpy.args[0]).to.deep.equal([devices]);
      done();
    });

    it('converts expirationInterval to APNS expiry', function() {
      givenProviderWithConfig();

      var notification = aNotification({ expirationInterval: 1 /* second */});
      provider.pushNotification(notification, aDeviceToken);

      var note = mockery.firstPushNotificationArgs()[0];
      expect(note.expiry).to.equal(1);
    });

    it('converts expirationTime to APNS expiry relative to now', function() {
      givenProviderWithConfig();

      var notification = aNotification({
        expirationTime: new Date(this.clock.now + 1000 /* 1 second */)
      });
      provider.pushNotification(notification, aDeviceToken);

      var note = mockery.firstPushNotificationArgs()[0];
      expect(note.expiry).to.equal(1);
    });

    it('ignores Notification properties not applicable', function() {
      givenProviderWithConfig();

      var notification = aNotification(objectMother.allNotificationProperties());
      provider.pushNotification(notification, aDeviceToken);

      var note = mockery.firstPushNotificationArgs()[0];
      expect(note.payload).to.eql({});
    });

  });

  describe('in dev env', function() {
    var notification;

    beforeEach(function setUp() {
      notification = new Notification();
    });

    it('emits "error" event when certData is invalid', function(done) {
      givenProviderWithConfig({
        apns: {
          pushOptions: {
            gateway: '127.0.0.1',
            certData: 'invalid-data'
          }
        }
      });

      var eventSpy = sinon.spy();
      provider.on('error', eventSpy);
      provider.pushNotification(notification, aDeviceToken);

      // wait for the provider to attempt to connect
      setTimeout(function() {
        expect(eventSpy.called, 'error event should be emitted')
          .to.equal(true);
        var args = eventSpy.firstCall.args;
        expect(args[0]).to.be.instanceOf(Error);
        done();
      }, 50);
    });

    it('emits "error" when gateway cannot be reached', function(done) {
      givenProviderWithConfig({
        apns: {
          pushOptions: {
            gateway: '127.0.0.1',
            certData: objectMother.apnsDevCert(),
            keyData: objectMother.apnsDevKey()
          }
        }
      });

      var eventSpy = sinon.spy();
      provider.on('error', eventSpy);

      provider.pushNotification(notification, aDeviceToken);

      // wait for the provider to attempt to connect
      setTimeout(function() {
        expect(eventSpy.called, 'error event should be emitted')
          .to.equal(true);
        var args = eventSpy.firstCall.args;
        expect(args[0]).to.be.instanceOf(Error);
        expect(args[0].code).to.equal('ECONNREFUSED');
        done();
      }, 150);
    });
  });

  function givenProviderWithConfig(pushSettings) {
    provider = new ApnsProvider(pushSettings);
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
