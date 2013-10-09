var apn = require('apn');
var path = require('path');
var loopback = require('loopback');

var app = loopback();

// expose a rest api
app.use(loopback.rest());

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
});

var ds = require('./data-sources/db');

var PushModel = require('../index')(app, {dataSource: ds});
var Application = PushModel.Application;
var DeviceRegistration = PushModel.DeviceRegistration;

app.use(loopback.static(path.join(__dirname, 'html')));

var fs = require('fs');
var certData = fs.readFileSync(path.join(__dirname, "credentials/apns_cert_dev.pem"), 'UTF-8');
var keyData = fs.readFileSync(path.join(__dirname, "credentials/apns_key_dev.pem"), 'UTF-8');

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

        // Register two devices
        DeviceRegistration.destroyAll(function (err, result) {
            console.log('Adding a test record');
            DeviceRegistration.create({
                appId: application.id,
                userId: 'raymond',
                deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305',
                deviceType: 'ios',
                created: new Date(),
                modified: new Date(),
                status: 'Active'
            }, function (err, result) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Registration record is created: ', result);
                }
            });
            DeviceRegistration.create({
                appId: application.id,
                userId: 'chandrika',
                deviceToken: 'a6127991 8f8d9731 766011fb 28f37c2b 746bcad6 f183c42d 9d8af31f 62f27910',
                deviceType: 'ios',
                created: new Date(),
                modified: new Date(),
                status: 'Active'
            }, function (err, result) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Registration record is created: ', result);
                }
            });

        });

        var badge = 1;
        app.post('/deviceRegistrations/:id/notify', function (req, res, next) {
            var note = new apn.Notification();

            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = badge++;
            note.sound = "ping.aiff";
            note.alert = "\uD83D\uDCE7 \u2709 " + 'Hello';
            note.payload = {'messageFrom': 'Ray'};

            PushModel.pushNotificationByRegistrationId(req.params.id, note);
            res.send(200, 'OK');
        });

        app.listen(app.get('port'), function () {
            console.log('http://127.0.0.1:' + app.get('port'));
        });
    });





