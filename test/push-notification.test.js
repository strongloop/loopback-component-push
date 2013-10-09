var loopback = require('loopback');
var apn = require('apn');
var assert = require('assert');
var path = require('path');

var ds = loopback.createDataSource('db', {connector: loopback.Memory});

var PushModel = require('../index')(null, {dataSource: ds});
var Application = PushModel.Application;
var DeviceRegistration = PushModel.DeviceRegistration;

var fs = require('fs');
var certData = fs.readFileSync(path.join(__dirname, "../example/credentials/apns_cert_dev.pem"), 'UTF-8');
var keyData = fs.readFileSync(path.join(__dirname, "../example/credentials/apns_key_dev.pem"), 'UTF-8');


describe('PushNotification', function () {
    it('registers a new device', function (done) {
        // Sign up an application
        Application.register('test-user', 'TestApp',
            {
                description: 'My test mobile application',
                pushSettings: {
                    apns: {
                        pushOptions: {
                            gateway: "gateway.sandbox.push.apple.com",
                            certData: certData,
                            keyData: keyData
                        },
                        feedbackOptions: {
                            gateway: "feedback.sandbox.push.apple.com",
                            certData: certData,
                            keyData: keyData,
                            batchFeedback: true,
                            interval: 300
                        }
                    }
                }
            }, function (err, result) {
                if (err) {
                    throw err;
                }
                var application = result;

                DeviceRegistration.destroyAll(function (err, result) {
                    console.log('Adding a test record');
                    DeviceRegistration.create({
                        appId: application.id,
                        userId: 'raymond',
                        deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305',
                        deviceType: 'memory',
                        created: new Date(),
                        modified: new Date(),
                        status: 'Active'
                    }, function (err, result) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('Registration record is created: ', result);
                        }

                        PushModel.dataSource.connector.applications[application.id] = {memory: {
                            push: {
                                pushNotification: function (notification, deviceToken) {
                                    console.log(notification, deviceToken);
                                    done();
                                }
                            }
                        }};

                        var note = new apn.Notification();

                        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                        note.badge = 5;
                        note.sound = "ping.aiff";
                        note.alert = "\uD83D\uDCE7 \u2709 " + 'Hello';
                        note.payload = {'messageFrom': 'Ray'};

                        PushModel.pushNotificationByRegistrationId(result.id, note);

                    });

                });
            });
    });

});

