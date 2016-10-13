// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
var PushModel = PushConnector.createPushModel({dataSource: ds});

var objectMother = require('./helpers/object-mother');

describe('PushNotification', function() {
  it('registers a new installation', function(done) {
        // Sign up an application
    Application.register('test-user', 'TestApp',
      {
        description: 'My test mobile application',
        pushSettings: {
          apns: {
            certData: objectMother.apnsDevCert(),
            keyData: objectMother.apnsDevKey(),
            pushOptions: {
            },
            feedbackOptions: {
              batchFeedback: true,
              interval: 300,
            },
          },
        },
      }, function(err, result) {
        if (err) {
          throw err;
        }
        var application = result;

        Installation.destroyAll(function(err, result) {
                    // console.log('Adding a test record');
          Installation.create({
            appId: application.id,
            userId: 'raymond',
            deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb ' +
              '56f60c2e f2a19241 e8f33305',
            deviceType: 'ios',
            created: new Date(),
            modified: new Date(),
            status: 'Active',
          }, function(err, result) {
            if (err) {
              console.error(err);
            } else {
                            // console.log('Registration record is created: ', result);
            }

            PushModel.dataSource.connector.applicationsCache.set(
              application.id,
              {
                memory: {
                  pushNotification: function(notification, deviceToken) {
                    // console.log(notification, deviceToken);
                    assert.equal(deviceToken, result.deviceToken);
                    done();
                  },
                },
              }
            );

            var note = new Notification();

                        // Expires 1 hour from now.
            note.expirationInterval = Math.floor(Date.now() / 1000) + 3600;
            note.badge = 5;
            note.sound = 'ping.aiff';
            note.alert = '\uD83D\uDCE7 \u2709 ' + 'Hello';
            note.messageFrom = 'Ray';

            PushModel.notifyById(
                          result.id,
                          note,
                          function(err) { if (err) throw err; done(); }
                        );
          });
        });
      });
  });
});
