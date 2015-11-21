
var inherits = require('util').inherits;
var extend = require('util')._extend;
var EventEmitter = require('events').EventEmitter;
var wns = require('wns');
var debug = require('debug')('loopback:component:push:provider:wns');

function WnsProvider(pushSettings) {
  var settings = pushSettings.wns || {};
  this._setupPushConnection(settings);
}

inherits(WnsProvider, EventEmitter);

exports = module.exports = WnsProvider;

WnsProvider.prototype._setupPushConnection = function(options) {

  debug('Using WNS Server API key %j', options.client_id, options.client_secret );
  var base;
  this.options = options;

  //if ((base = this.options).type == null) {
  //  base.type = "toast";
  //}
  //if (this.options.type === "tile" && !this.options.tileMapping) {
  //  throw new Error("Invalid WNS configuration: missing `tileMapping` for `tile` type");
  //}


};

WnsProvider.prototype.tokenFormat = /^https?:\/\/[a-zA-Z0-9-.]+\.notify\.windows\.com\/\S{0,500}$/;

WnsProvider.prototype.validateToken = function(token) {
  if (WnsProvider.prototype.tokenFormat.test(token)) {
    return token;
  }
};


WnsProvider.prototype.pushNotification = function(notification, deviceToken) {
  var self = this;
  var note = {};
  var sender;
  //var options = this.options;
  //var registrationIds = (typeof deviceToken == 'string') ? [deviceToken] : deviceToken;
  debug( "Pushing notification to ", notification, deviceToken );

  switch (notification.type) {
    case "toast":
      sender = wns.sendToastText02;
      note.text1 = notification.title;
      note.text2 = notification.message;

      //note.launch in options
      //note.duration: long, short in options
      break;

    case "tile":
      debug( "Not implemented: tile notifications");
      break;

    case "badge":
      debug( "Not implemented: badge notifications");
      break;

    case "raw":
      sender = wns.sendRaw;
      note = JSON.stringify( notification.data )
      break;

    default:
      debug( "Unsupported WNS notification type: ", notification.type );
  }

  if (sender) {
    try {

      debug("WNS client URL: " + deviceToken);

      return sender(deviceToken, note, this.options, function(error, result) {
        self.options.accessToken = error ? error.newAccessToken : result.newAccessToken;

        if (error) {
          if (error.shouldDeleteChannel) {
            debug("WNS Automatic unregistration for token " + deviceToken);
            self.emit('devicesGone', [deviceToken]);
          } else {
            self.emit('error', error);
          }
        } else {
          debug("WNS result: ", result );
        }
      });
    } catch (err) {
      debug("WNS Error: ", err );
      self.emit('error', err);
    }
  }
};
