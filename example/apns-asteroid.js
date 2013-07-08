var apn = require('apn');
var path = require('path');
var asteroid = require('asteroid');

var app = asteroid();

// expose a rest api
app.use(asteroid.rest());

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
});

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

var push = asteroid.createDataSource({
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

app.use(asteroid.static(path.join(__dirname, 'html')));

DeviceRegistration.destroyAll(function (err, result) {
    console.log('Adding a test record');
    DeviceRegistration.create({
        appId: 'MyAsteroidApp',
        userId: 'MyAsteroidUser',
        deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305',
        deviceType: 'apns',
        created: new Date(),
        lastModified: new Date(),
        status: 'Active'
    }, function (err, result) {
        console.log('Registration record is created: ', result);
    });
});

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





