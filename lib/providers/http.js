var http = require('http'),

    url = require('url');

function PushServiceHTTP(conf, logger, tokenResolver) {
    this.conf = conf;
    this.logger = logger;
}
PushServiceHTTP.prototype.validateToken = function (token) {
    var info, _ref;
    info = url.parse(token);
    if ((_ref = info != null ? info.protocol : undefined) === 'http:' || _ref === 'https:') {
        return token;
    }
};


PushServiceHTTP.prototype.push = function(subscriber, payload, subOptions) {
    var _this = this;
    return subscriber.get(function (info) {
        var body, options, req;
        options = url.parse(info.token);
        options.method = 'POST';
        options.headers = {
            'Content-Type': 'application/json',
            'Connection': 'close'
        };
        body = {
            event: payload.event.name,
            title: payload.title,
            message: payload.msg,
            data: payload.data
        };
        req = http.request(options);
        req.on('error', function (e) {
        });
        req.write(JSON.stringify(body));
        return req.end();
    });
};


exports.PushServiceHTTP = PushServiceHTTP;
