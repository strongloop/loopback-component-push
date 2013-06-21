
var  apns = require('apn');

function PushServiceAPNS(conf, logger, tokenResolver) {
    var _this = this;
    this.logger = logger;
    conf.errorCallback = function(errCode, note, device) {
        var _ref;
        return (_ref = _this.logger) != null ? _ref.error("APNS Error " + errCode + " for subscriber " + (device != null ? device.subscriberId : undefined)) : undefined;
    };
    this.driver = new apns.Connection(conf);
    this.payloadFilter = conf.payloadFilter;
    this.feedback = new apns.Feedback(conf);
    this.feedback.on('feedback', function(feedbackData) {
        return feedbackData.forEach(function(item) {
            return tokenResolver('apns', item.device.toString(), function(subscriber) {
                return subscriber != null ? subscriber.get(function(info) {
                    var _ref;
                    if (info.updated < item.time) {
                        if ((_ref = this.logger) != null) {
                            _ref.warn("APNS Automatic unregistration for subscriber " + subscriber.id);
                        }
                        return subscriber["delete"]();
                    }
                }) : undefined;
            });
        });
    });
}

    PushServiceAPNS.prototype.tokenFormat = /^[0-9a-f]{64}$/i;

    PushServiceAPNS.prototype.validateToken = function(token) {
      if (PushServiceAPNS.prototype.tokenFormat.test(token)) {
        return token.toLowerCase();
      }
    };



    PushServiceAPNS.prototype.push = function(subscriber, payload, subOptions) {
      var _this = this;
      return subscriber.get(function(info) {
        var alert, badge, device, key, note, val, _ref;
        note = new apns.Notification();
        device = new apns.Device(info.token);
        device.subscriberId = subscriber.id;
        if ((subOptions != null ? subOptions.ignore_message : undefined) !== true && (alert = payload.localizedMessage(info.lang))) {
          note.alert = alert;
        }
        if (!isNaN(badge = parseInt(info.badge) + 1)) {
          note.badge = badge;
        }
        note.sound = payload.sound;
        if (_this.payloadFilter != null) {
          _ref = payload.data;
          for (key in _ref) {
            val = _ref[key];
            if (__indexOf.call(_this.payloadFilter, key) >= 0) {
              note.payload[key] = val;
            }
          }
        } else {
          note.payload = payload.data;
        }
        _this.driver.pushNotification(note, device);
        return subscriber.incr('badge');
      });
  };

  exports.PushServiceAPNS = PushServiceAPNS;


