// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var fs = require('fs');
var path = require('path');
var ApnsProvider = require('../lib/providers/apns');
var mockery = require('./helpers/mockery').apns;
var objectMother = require('./helpers/object-mother');

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

      var notification = aNotification({
        aKey: 'a-value'
      });
      provider.pushNotification(notification, aDeviceToken);

      var apnArgs = mockery.firstPushNotificationArgs();

      var note = apnArgs[0];
      expect(note.expiry, 'expiry').to.equal(0);
      expect(note.alert, 'alert').to.equal(undefined);
      expect(note.badge, 'badge').to.equal(undefined);
      expect(note.sound, 'sound').to.equal(undefined);
      expect(note.payload, 'payload').to.deep.equal({
        aKey: 'a-value'
      });

      expect(apnArgs[1]).to.equal(aDeviceToken);
      done();
    });

    it('passes through special APN parameters', function(done) {
      givenProviderWithConfig();

      var notification = aNotification({
        contentAvailable: true,
        category: 'my-category',
        urlArgs: ['foo', 'bar'],
        arbitrary: 'baz'
      });
      provider.pushNotification(notification, aDeviceToken);

      var apnArgs = mockery.firstPushNotificationArgs();

      var note = apnArgs[0];
      var payload = note.toJSON();
      expect(payload.aps['content-available'], 'aps.content-available').to.equal(1);
      expect(payload.aps.category, 'aps.category').to.equal('my-category');
      expect(payload.aps['url-args'], 'aps.url-args').to.have.length(2);
      expect(payload.arbitrary, 'arbitrary').to.equal('baz');

      done();
    });

    it('raises "devicesGone" event when feedback arrives', function(done) {
      givenProviderWithConfig({
        apns: {
          feedbackOptions: {}
        }
      });
      var eventSpy = sinon.spy();
      provider.on('devicesGone', eventSpy);

      var devices = [aDeviceToken];
      mockery.emitFeedback(devices);

      expect(eventSpy.args[0]).to.deep.equal([devices]);
      done();
    });

    it('converts expirationInterval to APNS expiry', function() {
      givenProviderWithConfig();

      var notification = aNotification({
        expirationInterval: 1 /* second */
      });
      provider.pushNotification(notification, aDeviceToken);

      var note = mockery.firstPushNotificationArgs()[0];
      expect(note.expiry).to.equal(1);
    });

    it('converts expirationTime to APNS expiry relative to now', function() {
      givenProviderWithConfig();

      var notification = aNotification({
        expirationTime: new Date(this.clock.now + 1000 /* 1 second */ )
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
          certData: 'invalid-data',
          pushOptions: {
            gateway: '127.0.0.1',
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
          certData: objectMother.apnsDevCert(),
          keyData: objectMother.apnsDevKey(),
          pushOptions: {
            gateway: '127.0.0.1',
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
      }, 250);
    });
  });

  describe('APNS settings', function() {
    it('populates cert/key data', function(done) {
      givenProviderWithConfig({
        apns: {
          certData: objectMother.apnsDevCert(),
          keyData: objectMother.apnsDevKey(),
          pushOptions: {
            gateway: '127.0.0.1'
          }
        }
      });
      expect(provider._pushOptions).to.deep.equal({
        cert: objectMother.apnsDevCert(),
        key: objectMother.apnsDevKey(),
        gateway: '127.0.0.1',
        production: false,
      });
      expect(provider._feedbackOptions).to.deep.equal({
        cert: objectMother.apnsDevCert(),
        key: objectMother.apnsDevKey(),
        gateway: 'feedback.sandbox.push.apple.com',
        production: false,
      });
      done();
    });
    it('populates dev gateways without overriding', function(done) {
      givenProviderWithConfig({
        apns: {
          pushOptions: {
            gateway: 'push.test.com',
            port: 1111
          },
          feedbackOptions: {
            gateway: 'feedback.test.com',
            port: 1112
          }
        }
      });
      expect(provider._pushOptions).to.deep.equal({
        gateway: 'push.test.com',
        port: 1111,
        production: false,
      });
      expect(provider._feedbackOptions).to.deep.equal({
        gateway: 'feedback.test.com',
        port: 1112,
        production: false,
      });
      done();
    });
    it('populates dev gateways', function(done) {
      givenProviderWithConfig({
        apns: {
          // intentionally omit the pushOptions for test
          /*
           pushOptions: {
           },
           */
          feedbackOptions: {
            interval: 300
          }
        }
      });
      expect(provider._pushOptions).to.deep.equal({
        gateway: 'gateway.sandbox.push.apple.com',
        production: false,
      });
      expect(provider._feedbackOptions).to.deep.equal({
        gateway: 'feedback.sandbox.push.apple.com',
        interval: 300,
        production: false,
      });
      done();
    });
    it('populates prod gateways', function(done) {
      givenProviderWithConfig({
        apns: {
          production: true,
          pushOptions: {},
          feedbackOptions: {
            interval: 300,
            production: false,
          }
        }
      });
      expect(provider._pushOptions).to.deep.equal({
        gateway: 'gateway.push.apple.com',
        production: true,
      });
      expect(provider._feedbackOptions).to.deep.equal({
        gateway: 'feedback.push.apple.com',
        interval: 300,
        production: true,
      });
      done();
    });
    it('override prod gateways', function(done) {
      givenProviderWithConfig({
        apns: {
          production: true,
          pushOptions: {
            gateway: 'invalid',
            port: 1111
          },
          feedbackOptions: {
            gateway: 'invalid',
            port: 1112,
            interval: 300
          }
        }
      });
      expect(provider._pushOptions).to.deep.equal({
        gateway: 'gateway.push.apple.com',
        port: 2195,
        production: true,
      });
      expect(provider._feedbackOptions).to.deep.equal({
        gateway: 'feedback.push.apple.com',
        port: 2196,
        interval: 300,
        production: true,
      });
      done();
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