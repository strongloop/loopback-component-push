var apn = require('apn');

var options = { 
  "gateway": "gateway.sandbox.push.apple.com",
  "cert": "../credentials/apns_cert_dev.pem",
  "key": "../credentials/apns_key_dev.pem"
};

var apnConnection = new apn.Connection(options);
apnConnection.on('error', function(err) {
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
