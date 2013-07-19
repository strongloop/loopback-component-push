var loopback = require('loopback')
    , app = module.exports = loopback();

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

var ds = require('./data-sources/db');
var options = {
    dataSource: ds,
    config: {
        apns: {
            pushOptions: options,
            feedbackOptions: feedbackOptions
        }
    }
}

var push = require('../lib/index')(options);

app.use(loopback.bodyParser());

// expose a rest api
app.use(loopback.rest());

var path = require('path');

app.use(loopback.static(path.join(__dirname, 'html')));


var DeviceRegistration = push.DeviceRegistration;

var badge = 1;
DeviceRegistration.push = function(deviceToken, msg, sender) {
    var myDevice = new apn.Device(deviceToken);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = badge++;
    note.sound = "ping.aiff";
    note.alert = "\uD83D\uDCE7 \u2709 " + msg;
    note.payload = {'messageFrom': sender};

    push.pushNotification(myDevice, note);
}

DeviceRegistration.prototype.push = function(msg, sender) {
    console.log(msg, sender);
    DeviceRegistration.push(this.deviceToken, msg, sender);
}

app.model(DeviceRegistration);

DeviceRegistration.destroyAll(function (err, result) {
    console.log('Adding a test record');
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
    DeviceRegistration.create({
        appId: 'MyLoopbackApp',
        userId: 'chandrika',
        deviceToken: 'a6127991 8f8d9731 766011fb 28f37c2b 746bcad6 f183c42d 9d8af31f 62f27910',
        deviceType: 'apns',
        created: new Date(),
        modified: new Date(),
        status: 'Active'
    }, function (err, result) {
        console.log('Registration record is created: ', result);
    });

});

app.post('/deviceRegistrations/:id/notify', function(req, res, next) {
    // console.log(req.params.id);
    DeviceRegistration.findById(req.params.id, function(err, result) {
        if(!err && result) {
            result.push(req.body.msg, 'web');
            res.send(200, 'OK');
        } else {
            console.error(err);
            res.send(500, 'FAIL');
        }
    });
});

// start the server
app.listen(3000);
console.log('Server is ready at http://127.0.0.1:3000');
