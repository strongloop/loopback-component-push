var loopback = require(('loopback'));
var assert = require('assert');

var ds = loopback.createDataSource('db', {connector: loopback.Memory});

var Application = loopback.Application;
Application.attachTo(ds);

var Installation = require('../models/installation');
Installation.attachTo(ds);

var Notification = require('../models/notification');
Notification.attachTo(ds);

describe('Installation', function () {
    var registration = null;

    it('registers a new installation', function (done) {

        Installation.create({
            appId: 'MyLoopbackApp',
            appVersion: '1',
            userId: 'raymond',
            deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305',
            deviceType: 'ios',
            created: new Date(),
            modified: new Date(),
            status: 'Active'
        }, function (err, result) {
            if (err) {
                console.error(err);
                done(err, result);
                return;
            } else {
                var reg = result;
                assert.equal(reg.appId, 'MyLoopbackApp');
                assert.equal(reg.userId, 'raymond');
                assert.equal(reg.deviceType, 'ios');
                assert.equal(reg.deviceToken, '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305');

                assert(reg.created);
                assert(reg.modified);

                registration = reg;

                Installation.findByApp('ios', 'MyLoopbackApp', function (err, results) {
                    assert(!err);
                    assert.equal(results.length, 1);
                    var reg = results[0];
                    assert.equal(reg.appId, 'MyLoopbackApp');
                    assert.equal(reg.userId, 'raymond');
                    assert.equal(reg.deviceType, 'ios');
                    assert.equal(reg.deviceToken, '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305');
                    done(err, results);

                });
            }
        });

    });

});

