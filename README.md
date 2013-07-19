# Loopback Push Notification

Loopback Push Notification is a set of server side functions to enable mobile push notification services. It consists of
the following components:

## Features

* DeviceRegistration model and APIs to send notifications to devices of interest

* Wrapper APIs to multiple mobile push notification platforms, including:
  * apns
  * c2dm/gcm (TBD)
  * mpns (TBD)

* Scheduling notifications (TBD)

## Device Registration

The mobile applications need to first register itself with the backend using DeviceRegistration model and APIs.

### Model
A record of DeviceRegistration has the following properties:

    id: String (automatically generated id to identify the record)
    appId: String, (application id registerd with the Application model)
    appVersion: String, (optional application version)
    userId: String,
    deviceToken: String,
    deviceType: String,
    subscriptions: [String],
    status: String,
    created: Date,
    modified: Date

### Register a new device
To regsiter a device, we can call the DeviceRegistration.create API as follows:

    DeviceRegistration.create({
        appId: 'MyLoopbackApp',
        userId: 'raymond',
        deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305',
        deviceType: 'apns',
        created: new Date(),
        modified: new Date(),
        status: 'Active'
    }, function (err, result) {
        console.log('Registration record is created: ', result);
    });

The DeviceRegistrtion model is exposed as CRUD REST APIs via loopback.

        POST http://localhost:3000/deviceRegistrations
        {
            "appId": "MyLoopbackApp",
            "userId": "raymond",
            "deviceToken": "75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305",
            "deviceType": "apns"
        }

### Configure Loopback Push Notification

    var apn = require('apn');
    var path = require('path');
    var loopback = require('loopback');

    var app = loopback();

    // expose a rest api
    app.use(loopback.rest());

    ...

    var pushOptions = {
        "gateway": "gateway.sandbox.push.apple.com",
        "cert": path.join(__dirname, "credentials/apns_cert_dev.pem"),
        "key": path.join(__dirname, "credentials/apns_key_dev.pem")
    };

    var feedbackOptions = {
        "gateway": 'feedback.sandbox.push.apple.com',
        "cert": path.join(__dirname, "credentials/apns_cert_dev.pem"),
        "key": path.join(__dirname, "credentials/apns_key_dev.pem"),
        "batchFeedback": true,
        "interval": 300
    }

    var ds = require('./data-sources/db');

    var push = loopback.createDataSource({
        connector: require('../lib/push-connector'),
        config: {
            apns: {
                pushOptions: pushOptions,
                feedbackOptions: feedbackOptions
            }
        },
        dataSource: ds
    });

    var model = push.createModel('push');

    var DeviceRegistration = push.adapter.DeviceRegistration;
    app.model(DeviceRegistration);


    var badge = 1;
    app.post('/deviceRegistrations/:id/notify', function(req, res, next) {
        var note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = badge++;
        note.sound = "ping.aiff";
        note.alert = "\uD83D\uDCE7 \u2709 " + 'Hello';
        note.payload = {'messageFrom': 'Ray'};

        model.pushNotificationByRegistrationId(req.params.id, note);
        res.send(200, 'OK');
    });

    app.listen(app.get('port'));
    console.log('http://127.0.0.1:' + app.get('port'));


### Send notifications

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = badge++;
    note.sound = "ping.aiff";
    note.alert = "\uD83D\uDCE7 \u2709 " + 'Hello';
    note.payload = {'messageFrom': 'Ray'};

    model.pushNotificationByRegistrationId(req.params.id, note);

    /**
     * Push notification to a given device
     * @param deviceToken
     * @param notification
     */
    pushNotification(deviceToken, notification)

    /**
     * Push notification based the application
     * @param appId
     * @param appVersion
     * @param notification
     */
    pushNotificationByApp(appId, appVersion, notification, cb)

    /**
     * Push notification based the user
     * @param userId
     * @param notification
     */
    pushNotificationByUser(userId, notification, cb)

## Samples

We embed a folk of [apnagent-ios](https://github.com/logicalparadox/apnagent-ios) under example/apnagent-ios as the
iOS sample app to test push notifications.

You can find the installable app @ https://www.testflightapp.com/dashboard/applications/706217/builds/ too.

### Sample 1


    var apn = require('apn');
    var path = require('path');

    var options = {
        "gateway": "gateway.sandbox.push.apple.com",
        "cert": path.join(__dirname, "credentials/apns_cert_dev.pem"),
        "key": path.join(__dirname, "credentials/apns_key_dev.pem")
    };

    var feedbackOptions = {
        "gateway": 'feedback.sandbox.push.apple.com',
        "cert": path.join(__dirname, "credentials/apns_cert_dev.pem"),
        "key": path.join(__dirname, "credentials/apns_key_dev.pem"),
        "batchFeedback": true,
        "interval": 300
    }


    var apnConnection = new apn.Connection(options);
    apnConnection.on('error', function (err) {
        console.error(err);
    });

    var token = "75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305";

    var myDevice = new apn.Device(token);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
    note.payload = {'messageFrom': 'Caroline'};

    apnConnection.pushNotification(note, myDevice);

## References

1. https://github.com/argon/node-apn
2. https://github.com/rs/pushd
3. https://github.com/logicalparadox/apnagent-ios
4. https://blog.engineyard.com/2013/developing-ios-push-notifications-nodejs

