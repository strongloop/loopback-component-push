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

var token = "75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305";

var myDevice = new apn.Device(token);

var note = new apn.Notification();

note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 3;
note.sound = "ping.aiff";
note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
note.payload = {'messageFrom': 'Caroline'};

apnConnection.pushNotification(note, myDevice);
