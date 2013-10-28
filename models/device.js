/**
 * Module Dependencies
 */
var loopback = require('loopback');

/**
 * Device Model
 */
var Device = loopback.createModel('Device',
    {
        // The registration id
        id: {
            type: String,
            id: true,
            generated: true
        },
        appId: {type: String, required: true}, // The application id
        appVersion: String, // The application version, optional
        userId: String,
        deviceType: {type: String, required: true},
        deviceToken: {type: String, required: true},
        badge: Number,
        subscriptions: [String],
        timeZone: String,
        created: Date,
        modified: Date,
        status: String
    }
);

Device.beforeCreate = function (next) {
    var reg = this;
    reg.created = reg.modified = new Date();
    next();
};

/**
 * Find devices by application
 * @param {String} deviceType
 * @param {String} appId
 * @param {String} appVersion
 * @param {Fuction} cb
 *
 * @callback cb
 */
Device.findByApp = function (deviceType, appId, appVersion, cb) {
    if(!cb && typeof appVersion === 'function') {
        cb = appVersion;
        appVersion = undefined;
    }
    var filter = {where: {appId: appId, appVersion: appVersion, deviceType: deviceType}};
    Device.find(filter, cb);
};

/**
 * Find devices by user
 * @param userId
 * @param deviceType
 * @param cb
 */
Device.findByUser = function (deviceType, userId, cb) {
    var filter = {where: {userId: userId, deviceType: deviceType}};
    Device.find(filter, cb);
};

/**
 * Find devices by user
 * @param subscriptions
 * @param deviceType
 * @param cb
 */
Device.findBySubscription = function (deviceType, subscriptions, cb) {
    if(typeof subscriptions === 'string') {
        subscriptions = subscriptions.split(/[\s,]+/);
    }
    var filter = {where: {subscriptions: {inq: subscriptions}, deviceType: deviceType}};
    Device.find(filter, cb);
};

/*!
 * Configure the remoting attributes for a given function
 * @param {Function} fn The function
 * @param {Object} options The options
 * @private
 */
function setRemoting(fn, options) {
    options = options || {};
    for(var opt in options) {
        if(options.hasOwnProperty(opt)) {
            fn[opt] = options[opt];
        }
    }
    fn.shared = true;
}

setRemoting(Device.findByApp, {
    description: 'Find devices by application id',
    accepts: [
        {arg: 'deviceType', type: 'string', description: 'Device type', http: {source: 'query'}},
        {arg: 'appId', type: 'string', description: 'Application id', http: {source: 'query'}},
        {arg: 'appVersion', type: 'string', description: 'Application version', http: {source: 'query'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/byApp'}
});

setRemoting(Device.findByUser, {
    description: 'Find devices by user id',
    accepts: [
        {arg: 'deviceType', type: 'string', description: 'Device type', http: {source: 'query'}},
        {arg: 'userId', type: 'string', description: 'User id', http: {source: 'query'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/byUser'}
});

setRemoting(Device.findBySubscription, {
    description: 'Find devices by subscriptions',
    accepts: [
        {arg: 'deviceType', type: 'string', description: 'Device type', http: {source: 'query'}},
        {arg: 'subscriptions', type: 'string', description: 'Subscriptions', http: {source: 'query'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/bySubscription'}
});

module.exports = Device;




