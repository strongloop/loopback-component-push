var serial,__hasProp = {}.hasOwnProperty;

serial = 0;

Payload.prototype.locale_format = /^[a-z]{2}_[A-Z]{2}$/;

function Payload(data) {
    var key, prefix, subkey, sum, type, value, _i, _len, _ref, _ref1;
    if (typeof data !== 'object') {
        throw new Error('Invalid payload');
    }
    this.id = serial++;
    this.compiled = false;
    this.title = {};
    this.msg = {};
    this.data = {};
    this["var"] = {};
    for (key in data) {
        if (!__hasProp.call(data, key)) continue;
        value = data[key];
        if (typeof key !== 'string' || key.length === 0) {
            throw new Error("Invalid field (empty)");
        }
        if (typeof value !== 'string') {
            throw new Error("Invalid value for `" + key + "'");
        }
        switch (key) {
            case 'title':
                this.title["default"] = value;
                break;
            case 'msg':
                this.msg["default"] = value;
                break;
            case 'sound':
                this.sound = value;
                break;
            default:
                if ((_ref = key.split('.', 2), prefix = _ref[0], subkey = _ref[1], _ref).length === 2) {
                    this[prefix][subkey] = value;
                } else {
                    throw new Error("Invalid field: " + key);
                }
        }
    }
    sum = 0;
    _ref1 = ['title', 'msg', 'data'];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        type = _ref1[_i];
        sum += ((function () {
            var _ref2, _results;
            _ref2 = this[type];
            _results = [];
            for (key in _ref2) {
                if (!__hasProp.call(_ref2, key)) continue;
                _results.push(key);
            }
            return _results;
        }).call(this)).length;
    }
    if (sum === 0) {
        throw new Error('Empty payload');
    }
}

Payload.prototype.localizedTitle = function (lang) {
    return this.localized('title', lang);
};

Payload.prototype.localizedMessage = function (lang) {
    return this.localized('msg', lang);
};

Payload.prototype.localized = function (type, lang) {
    if (!this.compiled) {
        this.compile();
    }
    if (this[type][lang] != null) {
        return this[type][lang];
    } else if (Payload.prototype.locale_format.test(lang) && (this[type][lang.slice(0, 2)] != null)) {
        return this[type][lang.slice(0, 2)];
    } else if (this[type]["default"]) {
        return this[type]["default"];
    }
};

Payload.prototype.compile = function () {
    var lang, msg, type, _i, _len, _ref, _ref1;
    _ref = ['title', 'msg'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        _ref1 = this[type];
        for (lang in _ref1) {
            if (!__hasProp.call(_ref1, lang)) continue;
            msg = _ref1[lang];
            this[type][lang] = this.compileTemplate(msg);
        }
    }
    return this.compiled = true;
};

Payload.prototype.compileTemplate = function (tmpl) {
    var _this = this;
    return tmpl.replace(/\$\{(.*?)\}/g, function (match, keyPath) {
        return _this.variable(keyPath);
    });
};

Payload.prototype.variable = function (keyPath) {
    var key, prefix, _ref, _ref1, _ref2;
    if (keyPath === 'event.name') {
        if ((_ref = this.event) != null ? _ref.name : undefined) {
            return (_ref1 = this.event) != null ? _ref1.name : undefined;
        } else {
            throw new Error("The ${" + keyPath + "} does not exist");
        }
    }
    _ref2 = keyPath.split('.', 2), prefix = _ref2[0], key = _ref2[1];
    if (prefix !== 'var' && prefix !== 'data') {
        throw new Error("Invalid variable type for ${" + keyPath + "}");
    }
    if (this[prefix][key] == null) {
        throw new Error("The ${" + keyPath + "} does not exist");
    }
    return this[prefix][key];
};


exports.Payload = Payload;
