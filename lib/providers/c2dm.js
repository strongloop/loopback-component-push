var async = require('async'),
    c2dm = require('c2dm');

function PushServiceC2DM(conf, logger, tokenResolver) {
    var _this = this;
    this.logger = logger;
    if (conf.concurrency == null) {
        conf.concurrency = 10;
    }
    conf.keepAlive = true;
    this.driver = new c2dm.C2DM(conf);
    this.driver.login(function (err, token) {
        var queuedTasks, task, _i, _len, _ref, _results;
        if (err) {
            throw Error(err);
        }
        _ref = [
            _this.queue, async.queue((function () {
                return _this._pushTask.apply(_this, arguments);
            }), conf.concurrency)
        ], queuedTasks = _ref[0], _this.queue = _ref[1];
        _results = [];
        for (_i = 0, _len = queuedTasks.length; _i < _len; _i++) {
            task = queuedTasks[_i];
            _results.push(_this.queue.push(task));
        }
        return _results;
    });
    this.queue = [];
}

PushServiceC2DM.prototype.tokenFormat = /^[a-zA-Z0-9_-]+$/;

PushServiceC2DM.prototype.validateToken = function (token) {
    if (PushServiceC2DM.prototype.tokenFormat.test(token)) {
        return token;
    }
};


PushServiceC2DM.prototype.push = function(subscriber, payload, subOptions) {
    return this.queue.push({
        subscriber: subscriber,
        subOptions: subOptions,
        payload: payload
    });
};

PushServiceC2DM.prototype._pushTask = function (task, done) {
    var _this = this;
    return task.subscriber.get(function (info) {
        var key, message, note, title, value, _ref, _ref1, _ref2;
        note = {
            registration_id: info.token,
            collapse_key: (_ref = task.payload.event) != null ? _ref.name : undefined
        };
        if (((_ref1 = task.subOptions) != null ? _ref1.ignore_message : undefined) !== true) {
            if (title = task.payload.localizedTitle(info.lang)) {
                note['data.title'] = title;
            }
            if (message = task.payload.localizedMessage(info.lang)) {
                note['data.message'] = message;
            }
        }
        _ref2 = task.payload.data;
        for (key in _ref2) {
            value = _ref2[key];
            note["data." + key] = value;
        }
        return _this.driver.send(note, function (err, msgid) {
            var _ref3, _ref4;
            done();
            if (err === 'InvalidRegistration' || err === 'NotRegistered') {
                if ((_ref3 = _this.logger) != null) {
                    _ref3.warn("C2DM Automatic unregistration for subscriber " + task.subscriber.id);
                }
                return task.subscriber["delete"]();
            } else if (err) {
                return (_ref4 = _this.logger) != null ? _ref4.error("C2DM Error " + err + " for subscriber " + task.subscriber.id) : undefined;
            }
        });
    });
};


exports.PushServiceC2DM = PushServiceC2DM;
