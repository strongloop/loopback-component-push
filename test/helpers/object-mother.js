// An object mother is a kind of class used in testing to help create
// example objects that you use for testing.
// See http://martinfowler.com/bliki/ObjectMother.html

exports.allNotificationProperties = function() {
  return {
    deviceType: 'a-device-type',
    deviceToken: 'a-device-token',
    alert: 'an-alert',
    badge: 1230001,
    sound: 'a-sound',
    collapseKey: 'an-android-collapse-key',
    delayWhileIdle: true,
    created: new Date(2222, 1, 1),
    modified: new Date(2222, 2, 2),
    scheduledTime: new Date(2222, 3, 3),
    expirationTime: new Date(2222, 4, 4),
    expirationInterval: 123002,
    status: 'a-status'
  };
};

exports.apnsDevCert = function() {
  return readCredentialsSync('apns_cert_dev.pem');
};

exports.apnsDevKey = function() {
  return readCredentialsSync('apns_key_dev.pem');
};

var path = require('path');
var fs = require('fs');
function readCredentialsSync(fileName) {
  var relativePath = '../../example/server/credentials';
  var credentialsDir = path.resolve(__dirname, relativePath);
  return fs.readFileSync(path.join(credentialsDir, fileName), 'UTF-8');
}
