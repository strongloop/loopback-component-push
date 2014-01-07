/*!
 * Module Dependencies
 */
var loopback = require('loopback');

/**
 * Installation Model connects a mobile application to the device, the user and
 * other information for the server side to locate devices using application
 * id/version, user id, device type, and subscriptions.
 */
var Installation = loopback.createModel('Installation',
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

Installation.beforeCreate = function (next) {
    var reg = this;
    reg.created = reg.modified = new Date();
    next();
};

/**
 * Find installations by application id/version
 * @param {String} deviceType The device type
 * @param {String} appId The application id
 * @param {String} [appVersion] The application version
 * @callback {Function} cb The callback function
 * @param {Error|String} err The error object
 * @param {Installation[]} installations The selected installations
 */
Installation.findByApp = function (deviceType, appId, appVersion, cb) {
    if(!cb && typeof appVersion === 'function') {
        cb = appVersion;
        appVersion = undefined;
    }
    var filter = {where: {appId: appId, appVersion: appVersion, deviceType: deviceType}};
    Installation.find(filter, cb);
};

/**
 * Find installations by user id
 * @param {String} userId The user id
 * @param {String} deviceType The device type
 * @param {Function} cb The callback function
 *
 * @callback {Function} cb The callback function
 * @param {Error|String} err The error object
 * @param {Installation[]} installations The selected installations
 */
Installation.findByUser = function (deviceType, userId, cb) {
    var filter = {where: {userId: userId, deviceType: deviceType}};
    Installation.find(filter, cb);
};

/**
 * Find installations by subscriptions
 * @param {String|String[]} subscriptions A list of subscriptions
 * @param {String} deviceType The device type
 *
 * @callback {Function} cb The callback function
 * @param {Error|String} err The error object
 * @param {Installation[]} installations The selected installations
 */
Installation.findBySubscriptions = function (deviceType, subscriptions, cb) {
    if(typeof subscriptions === 'string') {
        subscriptions = subscriptions.split(/[\s,]+/);
    }
    var filter = {where: {subscriptions: {inq: subscriptions}, deviceType: deviceType}};
    Installation.find(filter, cb);
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

setRemoting(Installation.findByApp, {
    description: 'Find installations by application id',
    accepts: [
        {arg: 'deviceType', type: 'string', description: 'Device type', http: {source: 'query'}},
        {arg: 'appId', type: 'string', description: 'Application id', http: {source: 'query'}},
        {arg: 'appVersion', type: 'string', description: 'Application version', http: {source: 'query'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/byApp'}
});

setRemoting(Installation.findByUser, {
    description: 'Find installations by user id',
    accepts: [
        {arg: 'deviceType', type: 'string', description: 'Device type', http: {source: 'query'}},
        {arg: 'userId', type: 'string', description: 'User id', http: {source: 'query'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/byUser'}
});

setRemoting(Installation.findBySubscriptions, {
    description: 'Find installations by subscriptions',
    accepts: [
        {arg: 'deviceType', type: 'string', description: 'Device type', http: {source: 'query'}},
        {arg: 'subscriptions', type: 'string', description: 'Subscriptions', http: {source: 'query'}}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/bySubscriptions'}
});

module.exports = Installation;




