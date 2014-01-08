# LoopBack Push Notification

LoopBack Push Notification is a set of server side models to enable mobile push
notification services.

## Architecture

![push-notification.png](push-notification.png)

## Key Components

* Device model and APIs to manage devices with applications and users
* Application model to provide push settings for device types such as ios and
android
* Notification model to capture notification messages and persist scheduled
notifications
* Optional Job to take scheduled notification requests
* Push connector that interact with device registration records and push
providers such as APNS, GCM, and MPNS.
* Push model to provide high level APIs for device-independent push notifications

## Models and APIs for push notifications

### Sign up an application with push settings

To support push notifications, the mobile application needs to be registered
with LoopBack. The `Application` model has APIs for the sign-up.

    var fs = require('fs');
    var certData = fs.readFileSync(path.join(__dirname,
        "credentials/apns_cert_dev.pem"), 'UTF-8');
    var keyData = fs.readFileSync(path.join(__dirname,
        "credentials/apns_key_dev.pem"), 'UTF-8');

    // Sign up an application
    Application.register('test-user', 'TestApp',
        {
            description: 'My test mobile application',
            pushSettings: {
                certData: certData,
                keyData: keyData,
                apns: {
                    pushOptions: {
                        gateway: "gateway.sandbox.push.apple.com"
                    },
                    feedbackOptions: {
                        gateway: "feedback.sandbox.push.apple.com",
                        batchFeedback: true,
                        interval: 300
                    }
                }
            }
        }, function (err, result) {
            if (err) {
                throw err;
            }
            ...
        });

Once you sign up, you will get the application id that the client side should
use to register the device.

### Register a new device

The mobile device also needs to register itself with the backend using
Installation model and APIs. To register a device, we can call the
`Installation.create` API as follows:

    Installation.create({
        appId: 'MyLoopBackApp',
        userId: 'raymond',
        deviceToken: '756244503c9f95b49d7ff82120dc193ca1e3a7cb56f60c2ef2a19241e8f33305',
        deviceType: 'ios',
        created: new Date(),
        modified: new Date(),
        status: 'Active'
    }, function (err, result) {
        console.log('Registration record is created: ', result);
    });

The Installation model is exposed as CRUD REST APIs.

        POST http://localhost:3010/api/installations
        {
            "appId": "MyLoopBackApp",
            "userId": "raymond",
            "deviceToken": "756244503c9f95b49d7ff82120dc193ca1e3a7cb56f60c2ef2a19241e8f33305",
            "deviceType": "ios"
        }

### Configure LoopBack Push Notification

    var ds = require('./data-sources/db');
    var PushModel = require('loopback-push-notification')(app, {dataSource: ds});


### Send notifications

#### APNS

    var note = new PushModel.Notification({
      // Expires 1 hour from now.
      expirationTime: Math.floor(Date.now() / 1000) + 3600,
      badge: badge++,
      sound: "ping.aiff",
      alert: "\uD83D\uDCE7 \u2709 " + 'Hello',
      // Custom payload
      messageFrom: 'Ray'
    });

    PushModel.notifyById(req.params.id, note, function(err) {
      console.error('Cannot push notification', err);
    });

#### GCM

(To be done.)

## Samples

### Node.js server

You can find a demo LoopBack server application under 'example/server'. To run
it:

    cd example/server
    node app

Open your browser to [http://127.0.0.1:3010](http://127.0.0.1:3010).

By default, the app uses an in-memory store for the application/installation data.
You can switch it to a MongoDB instance with the MONGODB environment variable
set to the MongoDB url. For example,

    MONGODB=mongodb://localhost/demo node app

### iOS client

The iOS demo application is under example/ios. It uses LoopBack iOS SDK to enable
and handle push notifications. It's a folk of [apnagent-ios](https://github.com/logicalparadox/apnagent-ios).


### Android client

There is an Android sample app too (see [example/android]), it's a fork of the
sample client app provided by Google ([gcm](http://code.google.com/p/gcm)).
Check out [example/android/README.md] for more details.

## References

- https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/ApplePushService.html
- http://developer.android.com/google/gcm/index.html
- http://msdn.microsoft.com/en-us/library/windowsphone/develop/hh202945(v=vs.105).aspx
- https://github.com/argon/node-apn
- https://github.com/logicalparadox/apnagent-ios
- https://blog.engineyard.com/2013/developing-ios-push-notifications-nodejs

