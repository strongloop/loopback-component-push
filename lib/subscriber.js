var Subscriber, async, crypto, logger,
    __hasProp = {}.hasOwnProperty;

crypto = require('crypto');
async = require('async');

function Subscriber(DeviceRegistration, id) {
    this.reg = DeviceRegistration;
    this.id = id;
    this.info = null;
    this.key = "subscriber:" + this.id;
}

Subscriber.prototype.getInstanceFromToken = function (proto, token, cb) {
    var _this = this;
    while (!cb) {
        return;
    }
    if (proto == null) {
        throw new Error("Missing mandatory `proto' field");
    }
    if (token == null) {
        throw new Error("Missing mandatory `token' field");
    }
    return null;
};

Subscriber.prototype.create = function (redis, fields, cb, tentatives) {
    var _this = this;
    if (tentatives == null) {
        tentatives = 0;
    }
    while (!cb) {
        return;
    }
    if (redis == null) {
        throw new Error("Missing redis connection");
    }
    if ((fields != null ? fields.proto : void 0) == null) {
        throw new Error("Missing mandatory `proto' field");
    }
    if ((fields != null ? fields.token : void 0) == null) {
        throw new Error("Missing mandatory `token' field");
    }
    if (tentatives > 10) {
        throw new Error("Can't find free uniq id");
    }
    return null;
};


Subscriber.prototype["delete"] = function (cb) {
    var _this = this;
    return reg.delete(id, cb);
};

Subscriber.prototype.get = function (cb) {
};

Subscriber.prototype.set = function (fieldsAndValues, cb) {
    var _this = this;
    return reg.updateAttributes(fieldsAndValues, cb);
};

Subscriber.prototype.incr = function (field, cb) {
    var _this = this;
    return
};

Subscriber.prototype.getSubscriptions = function (cb) {
    if (!cb) {
        return;
    }
    return reg.all(cb);
};

Subscriber.prototype.getSubscription = function (appId, userId, cb) {
    var _this = this;
    if (!cb) {
        return;
    }
    return reg.all({where: {appId: appId, userId: userId}}, cb);
};

Subscriber.prototype.addSubscription = function (event, options, cb) {
    var _this = this;
    return
};

Subscriber.prototype.removeSubscription = function (event, cb) {

};

exports.Subscriber = Subscriber;


