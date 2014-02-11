
var async = require('async');

var PushManager = require('../lib/push-manager');
var Notification = require('../models/notification');
var loopback = require('loopback');
var Application = loopback.Application;
var Installation = require('../models/installation');

var expect = require('chai').expect;
var sinon = require('sinon');
var mockery = require('./helpers/mockery').stub;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var ref = TestDataBuilder.ref;

describe('PushManager', function() {
  beforeEach(mockery.setUp);
  beforeEach(Application.deleteAll.bind(Application));
  beforeEach(Installation.deleteAll.bind(Installation));
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
          .define('installation', Installation, {
            appId: ref('application.id'),
            deviceType: mockery.deviceType
          })
          .buildTo(context, cb);
      },

      function configureProvider(cb) {
        pushManager.configureApplication(
          context.installation.appId,
          context.installation.deviceType,
          cb);
      },

      function act(cb) {
        mockery.emitDevicesGone(context.installation.deviceToken);

        // Wait until the feedback is processed
        // We can use process.nextTick because Memory store
        // deletes the data within this event loop
        process.nextTick(cb);
      },

      function verify(cb) {
        Installation.find(function(err, result) {
          if (err) return cb(err);
          expect(result).to.have.length(0);
          cb();
        });
      }
    ], done);
  });

  describe('.notifyById', function() {
    it('sends notification to the correct installation', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('application', Application, {
              pushSettings: { stub: { } }
            })
            // Note: the order in which the installations are created
            // is important.
            // The installation that should not receive the notification must
            // be created first. This way the test fails when PushManager
            // looks up the installation via
            //   `Installation.findOne({ deviceToken: token })`
            .define('anotherDevice', Installation, {
              appId: ref('application.id'),
              deviceToken: 'a-device-token',
              deviceType: 'another-device-type'
            })
            .define('installation', Installation, {
              appId: ref('application.id'),
              deviceToken: 'a-device-token',
              deviceType: mockery.deviceType
            })
            .buildTo(context, cb);
        },

        function act(cb) {
          pushManager.notifyById(
            context.installation.id,
            context.notification,
            cb
          );
        },

        function verify(cb) {
          // Wait with the check to give the push manager some time
          // to load all data and push the message
          setTimeout(function() {
            expect(mockery.firstPushNotificationArgs()).to.deep.equal(
              [context.notification, context.installation.deviceToken]
            );
            cb();
          }, 50);
        }
      ], done);
    });

    it('reports error when installation was not found', function(done) {
      async.series([
        function actAndVerify(cb) {
          pushManager.notifyById(
            'unknown-installation-id',
            context.notification,
            verify
          );

          function verify(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.details)
              .to.have.property('installationId', 'unknown-installation-id');
            cb();
          }
        }
      ], done);
    });

    it('reports error when application was not found', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('installation', Installation, { appId: 'unknown-app-id' })
            .buildTo(context, cb);
        },

        function actAndVerify(cb) {
          pushManager.notifyById(
            context.installation.id,
            context.notification,
            verify
          );

          function verify(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.details)
              .to.have.property('appId', 'unknown-app-id');
            cb();
          }
        }
      ], done);
    });

    it('reports error when application has no pushSettings', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('application', Application, { pushSettings: null })
            .define('installation', Installation, {
              appId: ref('application.id'),
              deviceType: 'unknown-device-type'
            })
            .buildTo(context, cb);
        },

        function actAndVerify(cb) {
          pushManager.notifyById(
            context.installation.id,
            context.notification,
            verify
          );

          function verify(err) {
            expect(err).to.be.instanceOf(Error);
            expect(err.details).to.have.property('application');
            cb();
          }
        }
      ], done);

    });

    it('reports error for unknown device type', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('application', Application, { pushSettings: {}})
            .define('installation', Installation, {
              appId: ref('application.id'),
              deviceType: 'unknown-device-type'
            })
            .buildTo(context, cb);
        },

        function actAndVerify(cb) {
          pushManager.notifyById(
            context.installation.id,
            context.notification,
            verify
          );

          function verify(err) {
            expect(err).to.be.instanceOf(Error);
            cb();
          }
        }
      ], done);

    });

    it('emits error when push fails inside provider', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('application', Application, {
              pushSettings: { stub: { } }
            })
            .define('installation', Installation, {
              appId: ref('application.id'),
              deviceToken: 'a-device-token',
              deviceType: mockery.deviceType
            })
            .buildTo(context, cb);
        },

        function actAndVerify(cb) {
          var errorCallback = sinon.spy();
          pushManager.on('error', errorCallback);

          mockery.pushNotification = function() {
            this.emit('error', new Error('a test error'));
          };

          pushManager.notifyById(
            context.installation.id,
            context.notification,
            function(err) {
              if (err) throw err;
              expect(errorCallback.calledOnce, 'error was emitted')
                .to.equal(true);
              cb();
            }
          );
        }
      ], done);
    });
  });

  describe('.notifyByQuery', function() {
    it('sends notifications to the correct installations', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('application', Application, {
              pushSettings: { stub: { } }
            })
            .define('myPhone', Installation, {
              appId: ref('application.id'),
              deviceToken: 'my-phone-token',
              deviceType: mockery.deviceType,
              userId: 'myself'
            })
            .define('myOtherPhone', Installation, {
              appId: ref('application.id'),
              deviceToken: 'my-other-phone-token',
              deviceType: mockery.deviceType,
              userId: 'myself'
            })
            .define('friendsPhone', Installation, {
              appId: ref('application.id'),
              deviceToken: 'friends-phone-token',
              deviceType: mockery.deviceType,
              userId: 'somebody else'
            })
            .buildTo(context, cb);
        },

        function act(cb) {
          pushManager.notifyByQuery(
            { userId: 'myself' },
            context.notification,
            cb
          );
        },

        function verify(cb) {
          // Wait with the check to give the push manager some time
          // to load all data and push the message
          setTimeout(function() {
            var callsArgs = mockery.pushNotification.args;
            expect(callsArgs, 'number of notifications').to.have.length(2);
            expect(callsArgs[0]).to.deep.equal(
              [context.notification, context.myPhone.deviceToken]
            );
            expect(callsArgs[1]).to.deep.equal(
              [context.notification, context.myOtherPhone.deviceToken]
            );
            cb();
          }, 50);
        }
      ], done);
    });

    it('reports error on invalid notifications', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('myPhone', Installation, {
              userId: 'myself'
            })
            .buildTo(context, cb);
        },
        function act(cb) {
          pushManager.notifyByQuery(
            { userId: 'myself' },
            { invalid: true }, // invalid
            function(err) {
              expect(err.name).to.equal('ValidationError');
              cb();
            }
          );
        }
      ], done);
    });

    it('reports error on non-object notifications', function(done) {
      async.series([
        function arrange(cb) {
          new TestDataBuilder()
            .define('myPhone', Installation, {
              userId: 'myself'
            })
            .buildTo(context, cb);
        },

        function act(cb) {
          pushManager.notifyByQuery(
            { userId: 'myself' },
            "invalid notification", // invalid
            function(err) {
              expect(err.message).to.equal('notification must be an object');
              cb();
            }
          );
        }
      ], done);
    });

  });
});

describe('PushManager model dependencies', function() {
  beforeEach(function() {
    // Clean up the registry to avoid side effects
    delete loopback.Model.modelBuilder.models.installation;
    delete loopback.Model.modelBuilder.models.myInstallation;
    delete loopback.Model.modelBuilder.models.otherInstallation;
  });

  afterEach(function() {
    // Clean up the registry to avoid side effects
    delete loopback.Model.modelBuilder.models.installation;
    delete loopback.Model.modelBuilder.models.myInstallation;
    delete loopback.Model.modelBuilder.models.otherInstallation;
  });

  it('creates properties for dependent models', function() {
    var pm = new PushManager();
    expect(pm.Installation).to.be.equal(Installation);
    expect(pm.Notification).to.be.equal(Notification);
    expect(pm.Application).to.be.equal(Application);
  });

  it('uses subclasses for the dependent models', function() {
    var pm = new PushManager();
    var installationModel = Installation.extend('installation', {});
    expect(pm.Installation).to.be.equal(installationModel);
  });

  it('honors settings', function() {
    var pm = new PushManager({
      installation: 'myInstallation'
    });
    var myInstallation = Installation.extend('myInstallation', {});
    var otherInstallation = Installation.extend('otherInstallation', {});
    expect(pm.Installation).to.be.equal(myInstallation);
  });

  it('supports setters', function() {
    var pm = new PushManager({
      installation: 'myInstallation'
    });
    var myInstallation = Installation.extend('myInstallation', {});
    var otherInstallation = Installation.extend('otherInstallation', {});
    expect(pm.Installation).to.be.equal(myInstallation);
    pm.Installation = otherInstallation;
    expect(pm.Installation).to.be.equal(otherInstallation);
  });
});
