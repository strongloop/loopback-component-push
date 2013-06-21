/**
 * Registry for push notification service providers
 * @constructor
 */
function PushServices() {
}

PushServices.prototype.services = {};

PushServices.prototype.addService = function (protocol, service) {
    return this.services[protocol] = service;
};

PushServices.prototype.getService = function (protocol) {
    return this.services[protocol];
};

PushServices.prototype.push = function (subscriber, payload, options, cb) {
    var _this = this;
    return subscriber.get(function (info) {
        var _ref;
        if (info) {
            if ((_ref = _this.services[info.proto]) != null) {
                _ref.push(subscriber, payload, options);
            }
        }
        if (cb) {
            return cb();
        }
    });
};

module.exports = new PushServices();