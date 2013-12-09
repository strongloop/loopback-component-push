
var async = require('async');
var deepExtend = require('deep-extend');

var PushManager = require('../lib/push-manager');
var Notification = require('../models/notification');
var Application = require('loopback').Application;
var Device = require('../models/device');

var expect = require('chai').expect;
var mockery = require('./helpers/mockery');

describe('PushManager', function() {
  beforeEach(mockery.setUp);
  beforeEach(Application.deleteAll.bind(Application));
  beforeEach(Device.deleteAll.bind(Device));
  afterEach(mockery.tearDown);

  it('deletes devices no longer registered', function(done) {
    async.waterfall(
      [
        function(cb) {
          givenApplicationWithDeviceAndProvider(
            { pushSettings: { apns: { feedbackOptions: {}} } },
            { deviceType: 'ios' },
            cb);
        },

        function(app, device, provider, cb) {
          mockery.apns.emitFeedback(device.deviceToken);

          // Wait until the feedback is processed
          // We can use process.nextTick because Memory store
          // deletes the data within this event loop
          process.nextTick(function() {
            Device.find(function(err, result) {
              if (err) return cb(err);
              expect(result).to.be.empty;
              cb();
            });
          });
        }
      ],
      done
    );
  });

  function givenApplication(properties, callback) {
    var defaults = {
      description: 'a-test-app-description'
    };

    Application.register(
      'a-test-user',
      'a-test-app-name',
      deepExtend(defaults, properties),
      callback
    );
  }

  function givenDevice(properties, callback) {
    var defaults = {
      userId: 'a-test-user',
      deviceToken: 'a--device-token',
      created: new Date(),
      modified: new Date(),
      status: 'Active'
    };
    Device.create(deepExtend(defaults, properties), callback);
  }

  function givenApplicationWithDeviceAndProvider(appProperties,
                                                             deviceProperties,
                                                             callback) {
    async.waterfall(
      [
        function(cb) {
          givenApplication(appProperties, cb);
        },
        function(app, cb) {
          deviceProperties = deepExtend({ appId: app.id }, deviceProperties);
          givenDevice(
            deviceProperties,
            function(err, device) { cb(err, app, device); }
          );
        },
        function(app, device, cb) {
          var manager = new PushManager();
          manager.configureApplication(
            device.appId,
            device.deviceType,
            function(err, provider) { cb(err, app, device, provider); }
          );
        }
      ],
      callback);
  }
});
