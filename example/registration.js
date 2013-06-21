var asteroid = require('asteroid')
    , app = module.exports = asteroid();

var apn = require('apn');

var options = {
    "gateway": "gateway.sandbox.push.apple.com",
    "cert": "../credentials/apns_cert_dev.pem",
    "key": "../credentials/apns_key_dev.pem"
};

var feedbackOptions = {
    "gateway": 'feedback.sandbox.push.apple.com',
    "cert": "../credentials/apns_cert_dev.pem",
    "key": "../credentials/apns_key_dev.pem",
    "batchFeedback": true,
    "interval": 300
}

var feedback = new apn.Feedback(feedbackOptions);
feedback.on("feedback", function (devices) {
    devices.forEach(function (item) {
        console.log('Feedback received: ', item);
    });
});


var apnConnection = new apn.Connection(options);
apnConnection.on('error', function (err) {
    console.error(err);
});

// expose a rest api
app.use(asteroid.rest());

app.use(asteroid.static('html'));

var model = require('../models/device-registration');

model.prototype.push = function(msg, sender) {
    var myDevice = new apn.Device(this.deviceToken);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 3;
    note.sound = "ping.aiff";
    note.alert = "\uD83D\uDCE7 \u2709 " + msg;
    note.payload = {'messageFrom': sender};

    apnConnection.pushNotification(note, myDevice);
}

app.model(model);

model.destroyAll(function (err, result) {
    console.log('Adding a test record');
    model.create({
        appId: 'MyAsteroidApp',
        userId: 'MyAsteroidUser',
        deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305',
        deviceType: 'apns',
        created: new Date(),
        lastModified: new Date(),
        status: 'Active'
    }, function (err, result) {
        console.log('Registration record is created: ', result);
        result.push('Hi', 'Ray');
    });
});

// start the server
app.listen(3000);
console.log('Server is ready at http://127.0.0.1:3000');
