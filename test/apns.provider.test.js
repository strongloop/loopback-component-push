// Copyright IBM Corp. 2013,2018. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const assert = require('assert');
const sinon = require('sinon');
const loopback = require('loopback');
const ApnsProvider = require('../lib/providers/apns');
const mockery = require('./helpers/mockery').apns;
const objectMother = require('./helpers/object-mother');

const aDeviceToken = 'a-device-token';
const defaultConfiguration = {
  apns: {
    token: {
      keyId: 'key_id',
      key: 'key',
      teamId: 'team_id',
    },
    bundle: 'ch.test.app',
  },
};

const ds = loopback.createDataSource('db', {
  connector: loopback.Memory,
});

const Application = loopback.Application;
Application.attachTo(ds);

const PushConnector = require('../');
const Installation = PushConnector.Installation;
Installation.attachTo(ds);

const Notification = PushConnector.Notification;
Notification.attachTo(ds);

describe('APNS provider', function() {
  let provider;

  describe('in sandbox', function() {
    beforeEach(mockery.setUp);
    beforeEach(setUpFakeTimers);

    afterEach(tearDownFakeTimers);
    afterEach(mockery.tearDown);

    it('sends Notification as an APN message', function(done) {
      givenProviderWithConfig();

      const notification = aNotification({
        aKey: 'a-value',
      });
      provider.pushNotification(notification, aDeviceToken);

      const apnArgs = mockery.firstPushNotificationArgs();

      const note = apnArgs[0];
      expect(note.expiry, 'expiry').to.equal(0);
      expect(note.alert, 'alert').to.equal(undefined);
      expect(note.badge, 'badge').to.equal(undefined);
      expect(note.sound, 'sound').to.equal(undefined);
      expect(note.payload, 'payload').to.deep.equal({
        aKey: 'a-value',
      });

      expect(apnArgs[1]).to.equal(aDeviceToken);
      done();
    });

    it('passes through special APN parameters', function(done) {
      givenProviderWithConfig();

      const notification = aNotification({
        alert: 'You have a message from StrongLoop',
        messageFrom: 'StrongLoop',
        contentAvailable: true,
        category: 'my-category',
        urlArgs: ['foo', 'bar'],
        arbitrary: 'baz',
      });
      provider.pushNotification(notification, aDeviceToken);

      const apnArgs = mockery.firstPushNotificationArgs();

      const note = apnArgs[0];
      const payload = note.toJSON();
      expect(
        payload.aps['content-available'],
        'aps.content-available'
      ).to.equal(1);
      expect(payload.aps.category, 'aps.category').to.equal('my-category');
      expect(payload.aps['url-args'], 'aps.url-args').to.have.length(2);
      expect(payload.arbitrary, 'arbitrary').to.equal('baz');
      expect(payload.aps.alert.title, 'title').to.equal('StrongLoop');
      expect(payload.aps.alert.body, 'body').to.equal(
        'You have a message from StrongLoop'
      );

      done();
    });

    it('raises "devicesGone" event when feedback arrives', function(done) {
      givenProviderWithConfig();

      const notification = aNotification({
        aKey: 'a-value',
      });

      const eventSpy = sinon.spy();

      provider.on('devicesGone', eventSpy);
      provider.pushNotification(notification, aDeviceToken);

      // HACK: Timeout does not work at this point
      Promise.resolve(true).then(
        function() {
          assert(eventSpy.called);
          expect(eventSpy.args[0]).to.deep.equal([
            ['some_failing_device_token'],
          ]);

          done();
        },
        function() {}
      );
    });

    it('converts expirationInterval to APNS expiry', function() {
      givenProviderWithConfig();

      const notification = aNotification({
        expirationInterval: 1,
        /* second */
      });
      provider.pushNotification(notification, aDeviceToken);

      const note = mockery.firstPushNotificationArgs()[0];
      expect(note.expiry).to.equal(1);
    });

    it('converts expirationTime to APNS expiry relative to now', function() {
      givenProviderWithConfig();

      const notification = aNotification({
        expirationTime: new Date(this.clock.now + 1000 /* 1 second */),
      });
      provider.pushNotification(notification, aDeviceToken);

      const note = mockery.firstPushNotificationArgs()[0];
      expect(note.expiry).to.equal(1);
    });

    it('ignores Notification properties not applicable', function() {
      givenProviderWithConfig();

      const notification = aNotification(
        objectMother.allNotificationProperties()
      );
      provider.pushNotification(notification, aDeviceToken);

      const note = mockery.firstPushNotificationArgs()[0];
      expect(note.payload).to.eql({});
    });
  });

  describe('APNS settings', function() {
    it('populates bundle/token data', function(done) {
      givenProviderWithConfig({
        apns: {
          token: {
            keyId: 'my_key_id',
            key: 'my_key',
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
        },
      });

      expect(provider._pushOptions).to.deep.equal({
        token: {
          keyId: 'my_key_id',
          key: 'my_key',
          teamId: 'team_id',
        },
        bundle: 'my_bundle_id',
        production: false,
      });

      done();
    });

    it('uses by default the sandbox mode', function(done) {
      givenProviderWithConfig({
        apns: {
          token: {
            keyId: 'my_key_id',
            key: 'my_key',
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
        },
      });

      expect(provider._pushOptions.production === false);
      done();
    });

    it('uses production mode when set', function(done) {
      givenProviderWithConfig({
        apns: {
          token: {
            keyId: 'my_key_id',
            key: 'my_key',
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
        },
        production: true,
      });

      expect(provider._pushOptions.production === true);
      done();
    });

    it('uses sandbox mode when set', function(done) {
      givenProviderWithConfig({
        apns: {
          token: {
            keyId: 'my_key_id',
            key: 'my_key',
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
        },
        production: false,
      });

      expect(provider._pushOptions.production === false);
      done();
    });

    it('reports error when bundle is not specified', function(done) {
      const test = function() {
        givenProviderWithConfig({
          apns: {
            token: {
              keyId: 'my_key_id',
              key: 'my_key',
              teamId: 'team_id',
            },
          },
        });
      };

      assert.throws(test, Error, 'Error thrown');
      done();
    });

    it('reports error when token is not specified', function(done) {
      const test = function() {
        givenProviderWithConfig({
          bundle: 'the_bundle',
        });
      };

      assert.throws(test, Error, 'Error thrown');
      done();
    });

    it('reports error when token is missing a property', function(done) {
      const test = function() {
        givenProviderWithConfig({
          token: {
            keyId: 'key_id',
            key: 'key',
          },
          bundle: 'the_bundle',
        });
      };

      assert.throws(test, Error, 'Error thrown');
      done();
    });
  });

  /**
   * Creates a provider with specified configuration. If configuration is left empty, a default one is created.
   * @param pushSettings
   */
  function givenProviderWithConfig(pushSettings) {
    // use a sensible default if nothing was specified
    if (typeof pushSettings === 'undefined') {
      pushSettings = defaultConfiguration;
    }

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
