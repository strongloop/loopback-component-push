// An object mother is a kind of class used in testing to help create
// example objects that you use for testing.
// See http://martinfowler.com/bliki/ObjectMother.html

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
