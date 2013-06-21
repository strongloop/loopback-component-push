var gcm = require('node-gcm');
function PushServiceGCM(conf, logger, tokenResolver) {
    this.logger = logger;
    if (conf.concurrency == null) {
        conf.concurrency = 10;
    }
    this.driver = new gcm.Sender(conf.key);
    this.multicastQueue = {};
}

PushServiceGCM.prototype.tokenFormat = /^[a-zA-Z0-9_-]+$/;

PushServiceGCM.prototype.validateToken = function (token) {
    if (PushServiceGCM.prototype.tokenFormat.test(token)) {
        return token;
    }
};


PushServiceGCM.prototype.push = function(subscriber, payload, subOptions) {
    var _this = this;
    return subscriber.get(function (info) {
        var key, message, messageKey, note, title, value, _ref, _ref1;
        messageKey = "" + payload.id + "-" + (info.lang || 'int') + "-" + (!!(subOptions != null ? subOptions.ignore_message : undefined));
        if (messageKey in _this.multicastQueue && _this.multicastQueue[messageKey].tokens.length >= 1000) {
            _this.send(messageKey);
        }
        if (messageKey in _this.multicastQueue) {
            _this.multicastQueue[messageKey].tokens.push(info.token);
            return _this.multicastQueue[messageKey].subscribers.push(subscriber);
        } else {
            note = new gcm.Message();
            note.collapseKey = (_ref = payload.event) != null ? _ref.name : undefined;
            if ((subOptions != null ? subOptions.ignore_message : undefined) !== true) {
                if (title = payload.localizedTitle(info.lang)) {
                    note.addData('title', title);
                }
                if (message = payload.localizedMessage(info.lang)) {
                    note.addData('message', message);
                }
            }
            _ref1 = payload.data;
            for (key in _ref1) {
                value = _ref1[key];
                note.addData(key, value);
            }
            _this.multicastQueue[messageKey] = {
                tokens: [info.token],
                subscribers: [subscriber],
                note: note
            };
            return _this.multicastQueue[messageKey].timeoutId = setTimeout((function () {
                return _this.send(messageKey);
            }), 500);
        }
    });
};

PushServiceGCM.prototype.send = function (messageKey) {
    var message,
        _this = this;
    message = this.multicastQueue[messageKey];
    delete this.multicastQueue[messageKey];
    clearTimeout(message.timeoutId);
    return this.driver.send(message.note, message.tokens, 4, function (err, multicastResult) {
        var i, result, _i, _len, _ref, _ref1, _results;
        if (multicastResult == null) {
            return (_ref = _this.logger) != null ? _ref.error("GCM Error: empty response") : undefined;
        } else if ('results' in multicastResult) {
            _ref1 = multicastResult.results;
            _results = [];
            for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
                result = _ref1[i];
                _results.push(_this.handleResult(result, message.subscribers[i]));
            }
            return _results;
        } else {
            return _this.handleResult(multicastResult, message.subscribers[0]);
        }
    });
};

PushServiceGCM.prototype.handleResult = function (result, subscriber) {
    var error, _ref, _ref1;
    if (result.messageId || result.message_id) {

    } else {
        error = result.error || result.errorCode;
        if (error === "NotRegistered" || error === "InvalidRegistration") {
            if ((_ref = this.logger) != null) {
                _ref.warn("GCM Automatic unregistration for subscriber " + subscriber.id);
            }
            return subscriber["delete"]();
        } else {
            return (_ref1 = this.logger) != null ? _ref1.error("GCM Error: " + error) : undefined;
        }
    }
}

exports.PushServiceGCM = PushServiceGCM;


