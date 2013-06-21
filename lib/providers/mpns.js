var mpns = require('mpns');

function PushServiceMPNS(conf, logger, tokenResolver) {
    var _base;
    this.conf = conf;
    this.logger = logger;
    if ((_base = this.conf).type == null) {
        _base.type = "toast";
    }
    if (this.conf.type === "tile" && !this.conf.tileMapping) {
        throw new Error("Invalid MPNS configuration: missing `tileMapping` for `tile` type");
    }
}
PushServiceMPNS.prototype.tokenFormat = /^https?:\/\/[a-zA-Z0-9-.]+\.notify\.live\.net\/\S{0,500}$/;

PushServiceMPNS.prototype.validateToken = function (token) {
    if (PushServiceMPNS.prototype.tokenFormat.test(token)) {
        return token;
    }
};


PushServiceMPNS.prototype.push = function(subscriber, payload, subOptions) {
    var _this = this;
    return subscriber.get(function (info) {
        var e, error, key, map, message, note, properties, property, sender, title, value, _i, _len, _ref, _ref1, _ref2;
        note = {};
        switch (_this.conf.type) {
            case "toast":
                if ((subOptions != null ? subOptions.ignore_message : undefined) !== true) {
                    sender = mpns.sendToast;
                    note.text1 = payload.localizedTitle(info.lang) || '';
                    note.text2 = payload.localizedMessage(info.lang);
                    if (_this.conf.paramTemplate && info.version >= 7.5) {
                        try {
                            note.param = payload.compileTemplate(_this.conf.paramTemplate);
                        } catch (_error) {
                            e = _error;
                            _this.logger.error("Cannot compile MPNS param template: " + e);
                            return;
                        }
                    }
                }
                break;
            case "tile":
                map = _this.conf.tileMapping;
                properties = ["id", "title", "count", "backgroundImage", "backBackgroundImage", "backTitle", "backContent"];
                if (info.version >= 8.0) {
                    sender = mpns.sendFlipTile;
                    properties.push.apply(properties, ["smallBackgroundImage", "wideBackgroundImage", "wideBackContent", "wideBackBackgroundImage"]);
                } else {
                    sender = mpns.sendTile;
                }
                for (_i = 0, _len = properties.length; _i < _len; _i++) {
                    property = properties[_i];
                    if (map[property]) {
                        try {
                            note[property] = payload.compileTemplate(map[property]);
                        } catch (_error) {
                            e = _error;
                        }
                    }
                }
                break;
            case "raw":
                sender = mpns.sendRaw;
                if ((subOptions != null ? subOptions.ignore_message : undefined) !== true) {
                    if (title = payload.localizedTitle(info.lang)) {
                        note['title'] = title;
                    }
                    if (message = payload.localizedMessage(info.lang)) {
                        note['message'] = message;
                    }
                }
                _ref = payload.data;
                for (key in _ref) {
                    value = _ref[key];
                    note[key] = value;
                }
                note = {
                    payload: JSON.stringify(payload.data)
                };
                break;
            default:
                if ((_ref1 = _this.logger) != null) {
                    _ref1.error("Unsupported MPNS notification type: " + _this.conf.type);
                }
        }
        if (sender) {
            try {
                return sender(info.token, note, function (error, result) {
                    var _ref2, _ref3, _ref4;
                    if (error) {
                        if (error.shouldDeleteChannel) {
                            if ((_ref2 = _this.logger) != null) {
                                _ref2.warn("MPNS Automatic unregistration for subscriber " + subscriber.id);
                            }
                            return subscriber["delete"]();
                        } else {
                            return (_ref3 = _this.logger) != null ? _ref3.error("MPNS Error: (" + error.statusCode + ") " + error.innerError) : undefined;
                        }
                    } else {
                        return (_ref4 = _this.logger) != null ? _ref4.verbose("MPNS result: " + (JSON.stringify(result))) : undefined;
                    }
                });
            } catch (_error) {
                error = _error;
                return (_ref2 = _this.logger) != null ? _ref2.error("MPNS Error: " + error) : undefined;
            }
        }
    });
};


exports.PushServiceMPNS = PushServiceMPNS;