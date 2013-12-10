
var async = require('async');

var PushManager = require('../lib/push-manager');
var Notification = require('../models/notification');
var Application = require('loopback').Application;
var Device = require('../models/device');

var expect = require('chai').expect;
var mockery = require('./helpers/mockery').stub;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var ref = TestDataBuilder.ref;

describe('PushManager', function() {
  beforeEach(mockery.setUp);
  beforeEach(Application.deleteAll.bind(Application));
  beforeEach(Device.deleteAll.bind(Device));
  afterEach(mockery.tearDown);

  var pushManager;
  var context;

  beforeEach(function(done) {
    pushManager = new PushManager();
    context = {};
    new TestDataBuilder()
      .define('notification', Notification)
      .buildTo(context, done);
  });

  it('deletes devices no longer registered', function(done) {
    async.series([
      function arrange(cb) {
        new TestDataBuilder()
          .define('application', Application, {
            pushSettings: { stub: { } }
          })
          .define('device', Device, {
            appId: ref('application.id'),
            deviceType: mockery.deviceType
          })
          .buildTo(context, cb);
      },

      function configureProvider(cb) {
        pushManager.configureApplication(
          context.device.appId,
          context.device.deviceType,
          cb);
      },

      function act(cb) {
        mockery.emitDevicesGone(context.device.deviceToken);

        // Wait until the feedback is processed
        // We can use process.nextTick because Memory store
        // deletes the data within this event loop
        process.nextTick(cb);
      },

      function verify(cb) {
        Device.find(function(err, result) {
          if (err) return cb(err);
          expect(result).to.have.length(0);
          cb();
        });
      }
    ], done);
  });

  describe('.pushNotificationByRegistrationId', function() {
    it('sends notification to the correct device', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('application', Application, {
              pushSettings: { stub: { } }
            })
            .define('device', Device, {
              appId: ref('application.id'),
              deviceToken: 'a-device-token',
              deviceType: mockery.deviceType
            })
            .buildTo(context, cb);
        },

        function act(cb) {
          pushManager.pushNotificationByRegistrationId(
            context.device.id,
            context.notification,
            cb
          );
        },

        function verify(cb) {
          // Wait with the check to give the push manager some time
          // to load all data and push the message
          setTimeout(function() {
            expect(mockery.firstPushNotificationArgs()).to.deep.equal(
              [context.notification, context.device.deviceToken]
            );
            cb();
          }, 50);
        }
      ], done);
    });
  });
});
