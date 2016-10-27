// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var fs = require('fs');
var path = require('path');
var ApnsProvider = require('../lib/providers/apns');
var mockery = require('./helpers/mockery').apns;
var objectMother = require('./helpers/object-mother');

var aDeviceToken = 'a-device-token';
var defaultConfiguration = {
  apns: {
    token: {
      keyId: 'key_id',
      key: 'key',
<<<<<<< HEAD
<<<<<<< HEAD
      teamId: 'team_id',
    },
    bundle: 'ch.test.app',
  },
=======
      teamId: 'team_id'
    },
    bundle: 'ch.test.app'
  }
>>>>>>> 07d0cd0... enhance: Make some unit tests work
=======
      teamId: 'team_id',
    },
    bundle: 'ch.test.app',
  },
>>>>>>> 74e5fdd... enhance: make linter not fail
};

describe('APNS provider', function() {
  var provider;

  describe('in sandbox', function() {
    beforeEach(mockery.setUp);
    beforeEach(setUpFakeTimers);

    afterEach(tearDownFakeTimers);
    afterEach(mockery.tearDown);

    it('sends Notification as an APN message', function(done) {
      givenProviderWithConfig(defaultConfiguration);

      var notification = aNotification({
        aKey: 'a-value',
      });
      provider.pushNotification(notification, aDeviceToken);

      var apnArgs = mockery.firstPushNotificationArgs();

      var note = apnArgs[0];
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
      givenProviderWithConfig(defaultConfiguration);

      var notification = aNotification({
        contentAvailable: true,
        category: 'my-category',
        urlArgs: ['foo', 'bar'],
        arbitrary: 'baz',
      });
      provider.pushNotification(notification, aDeviceToken);

      var apnArgs = mockery.firstPushNotificationArgs();

      var note = apnArgs[0];
      var payload = note.toJSON();
      expect(payload.aps['content-available'], 'aps.content-available').to
        .equal(1);
      expect(payload.aps.category, 'aps.category').to.equal('my-category');
      expect(payload.aps['url-args'], 'aps.url-args').to.have.length(2);
      expect(payload.arbitrary, 'arbitrary').to.equal('baz');

      done();
    });

    it('raises "devicesGone" event when feedback arrives', function(done) {
<<<<<<< HEAD
      givenProviderWithConfig();
=======
      givenProviderWithConfig(defaultConfiguration);
>>>>>>> 07d0cd0... enhance: Make some unit tests work

      var notification = aNotification({
        aKey: 'a-value',
      });

      var eventSpy = sinon.spy();
<<<<<<< HEAD

      provider.on('devicesGone', eventSpy);
      provider.pushNotification(notification, aDeviceToken);

<<<<<<< HEAD
      // HACK: Timeout does not work at this point
      Promise.resolve(true).then(function() {
        assert(eventSpy.called);
        expect(eventSpy.args[0]).to.deep.equal([['some_failing_device_token']]);
=======
      var devices = [aDeviceToken];
=======
>>>>>>> d6def49... enhance: Done sandbox tests

      provider.on('devicesGone', eventSpy);
      provider.pushNotification(notification, aDeviceToken);
>>>>>>> 07d0cd0... enhance: Make some unit tests work

<<<<<<< HEAD
        done();
      }, function() {
=======
      // HACK: Timeout does not work at this point
      Promise.resolve(true).then(function() {
        assert(eventSpy.called);
        done();
>>>>>>> d6def49... enhance: Done sandbox tests
      });
    });

    it('converts expirationInterval to APNS expiry', function() {
      givenProviderWithConfig(defaultConfiguration);

      var notification = aNotification({
        expirationInterval: 1, /* second */
      });
      provider.pushNotification(notification, aDeviceToken);

      var note = mockery.firstPushNotificationArgs()[0];
      expect(note.expiry).to.equal(1);
    });

    it('converts expirationTime to APNS expiry relative to now', function() {
      givenProviderWithConfig(defaultConfiguration);

      var notification = aNotification({
        expirationTime: new Date(this.clock.now + 1000 /* 1 second */),
      });
      provider.pushNotification(notification, aDeviceToken);

      var note = mockery.firstPushNotificationArgs()[0];
      expect(note.expiry).to.equal(1);
    });

    it('ignores Notification properties not applicable', function() {
      givenProviderWithConfig(defaultConfiguration);

      var notification = aNotification(
        objectMother.allNotificationProperties());
      provider.pushNotification(notification, aDeviceToken);

      var note = mockery.firstPushNotificationArgs()[0];
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
<<<<<<< HEAD
<<<<<<< HEAD
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
=======
            teamId: 'team_id'
          },
          bundle: 'my_bundle_id'
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
>>>>>>> 74e5fdd... enhance: make linter not fail
        },
      });

      expect(provider._pushOptions).to.deep.equal({
        token: {
          keyId: 'my_key_id',
          key: 'my_key',
          teamId: 'team_id',
        },
        bundle: 'my_bundle_id',
<<<<<<< HEAD
<<<<<<< HEAD
        production: false,
=======
        production: false
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
        production: false,
>>>>>>> 74e5fdd... enhance: make linter not fail
      });

      done();
    });

    it('uses by default the sandbox mode', function(done) {
      givenProviderWithConfig({
        apns: {
          token: {
            keyId: 'my_key_id',
            key: 'my_key',
<<<<<<< HEAD
<<<<<<< HEAD
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
=======
            teamId: 'team_id'
          },
          bundle: 'my_bundle_id'
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
>>>>>>> 74e5fdd... enhance: make linter not fail
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
<<<<<<< HEAD
<<<<<<< HEAD
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
        },
        production: true,
=======
            teamId: 'team_id'
=======
            teamId: 'team_id',
>>>>>>> 74e5fdd... enhance: make linter not fail
          },
          bundle: 'my_bundle_id',
        },
<<<<<<< HEAD
        production: true
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
        production: true,
>>>>>>> 74e5fdd... enhance: make linter not fail
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
<<<<<<< HEAD
<<<<<<< HEAD
            teamId: 'team_id',
          },
          bundle: 'my_bundle_id',
        },
        production: false,
=======
            teamId: 'team_id'
=======
            teamId: 'team_id',
>>>>>>> 74e5fdd... enhance: make linter not fail
          },
          bundle: 'my_bundle_id',
        },
<<<<<<< HEAD
        production: false
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
        production: false,
>>>>>>> 74e5fdd... enhance: make linter not fail
      });

      expect(provider._pushOptions.production === false);
      done();
    });

    it('reports error when bundle is not specified', function(done) {
<<<<<<< HEAD
<<<<<<< HEAD
      var test = function() {
=======
      var test = function(){
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
      var test = function() {
>>>>>>> 74e5fdd... enhance: make linter not fail
        givenProviderWithConfig({
          apns: {
            token: {
              keyId: 'my_key_id',
              key: 'my_key',
<<<<<<< HEAD
<<<<<<< HEAD
              teamId: 'team_id',
            },
          },
=======
              teamId: 'team_id'
            }
          }
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
              teamId: 'team_id',
            },
          },
>>>>>>> 74e5fdd... enhance: make linter not fail
        });
      };

      assert.throws(test, Error, 'Error thrown');
      done();
    });

    it('reports error when token is not specified', function(done) {
<<<<<<< HEAD
<<<<<<< HEAD
      var test = function() {
        givenProviderWithConfig({
          bundle: 'the_bundle',
=======
      var test = function(){
        givenProviderWithConfig({
          bundle: 'the_bundle'
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
      var test = function() {
        givenProviderWithConfig({
          bundle: 'the_bundle',
>>>>>>> 74e5fdd... enhance: make linter not fail
        });
      };

      assert.throws(test, Error, 'Error thrown');
      done();
    });

    it('reports error when token is missing a property', function(done) {
<<<<<<< HEAD
<<<<<<< HEAD
      var test = function() {
        givenProviderWithConfig({
          token: {
            keyId: 'key_id',
            key: 'key',
          },
          bundle: 'the_bundle',
=======
      var test = function(){
=======
      var test = function() {
>>>>>>> 74e5fdd... enhance: make linter not fail
        givenProviderWithConfig({
          token: {
            keyId: 'key_id',
            key: 'key',
          },
<<<<<<< HEAD
          bundle: 'the_bundle'
>>>>>>> a94d4b1... add: Enhanced tests for APNS provider
=======
          bundle: 'the_bundle',
>>>>>>> 74e5fdd... enhance: make linter not fail
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
