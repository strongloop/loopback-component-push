
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

  beforeEach(function createPushManager() {
    pushManager = new PushManager();
    context = {};
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
          .define('notification', Notification)
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
});
