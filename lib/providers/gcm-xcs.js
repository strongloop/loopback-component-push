
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var gcm = require('node-xcs');

var Sender = require('node-xcs').Sender;
var Result = require('node-xcs').Result;
var Message = require('node-xcs').Message;
var Notification = require('node-xcs').Notification;

var GcmProvider = require('./gcm');
var debug = require('debug')('loopback:component:push:provider:gcm-xcs');

function GcmCcsProvider(pushSettings) {
  var settings = pushSettings.gcm || {};
  this._setupPushConnection(settings);
}

inherits(GcmCcsProvider, EventEmitter);
inherits(GcmCcsProvider, GcmProvider);

exports = module.exports = GcmCcsProvider;

GcmCcsProvider.prototype._setupPushConnection = function(options) {
  debug('Using GCM-XCS Server API key %s & senderId %s', options.serverApiKey, options.senderId);
  if(!options.serverApiKey || !options.senderId) {
    return "No senderId or serverApiKey defined";
  }
  var self = this;
  this._connection = new Sender(options.senderId, options.serverApiKey);
  this._connection.on('message', function(messageId, from, data, category){
    debug('message ', messageId, from, category, data);
    self.emit('gcm-ccs-message', messageId, from, category, data);
  });
  this._connection.on('receipt', function(messageId, from, data, category){
    debug('Delivery ', messageId, from, category, data);
    self.emit('gcm-ccs-delivery', messageId, from, category, data);
  });
  this._connection.on('connected', function(){
    debug('Connected');
  });
  this._connection.on('disconnected', function(){
    debug('Disconnected');
    self.emit('gcm-ccs-disconnected');
  });
  this._connection.on('online', function(){
    debug('Online');
  });
  this._connection.on('error', function(err){
    debug('Error ',err);
    self.emit('error', new Error(err));
  });
  this._connection.on('message-error', function(err){
    debug('message-error ',err);
    self.emit('error', new Error(err));
  });
};

GcmCcsProvider.prototype.pushNotification = function(notification, deviceToken) {
  var self = this;
  var targets = [];
  if( deviceToken && deviceToken.topic ) {
    targets = [deviceToken.topic];
  } else {
    targets = (typeof deviceToken == 'string') ? [deviceToken] : deviceToken;
  }
  debug('Sending message to %j: %j', targets, notification);
  if( notification.priority === 10) {
    notification.priority = 'high';
  }
  // var options = {
  //   delivery_receipt_requested: true,
  //   priority: notification.priority || 'normal',
  //   collapse_key: notification.collapseKey,
  //   delay_while_idle: notification.delayWhileIdle,
  //   time_to_live: notification.getTimeToLiveInSecondsFromNow(),
  //   dry_run: notification.dryRun
  // };

  targets.map( function(token){
    var xcs_notif = new Notification(notification.messageIcon || 'ic_launcher');
    if(notification.messageTitle) {
      xcs_notif
        .title(notification.messageTitle)
        .body(notification.message);
    } else {
      xcs_notif.title(notification.message);
    }
    xcs_notif.badge(notification.androidBadge);
    if(notification.sound) {
      xcs_notif.sound(notification.sound);
    }
    if(notification.sound) {
      xcs_notif.sound(notification.sound);
    }
    if(notification.tag) {
      xcs_notif.tag(notification.tag);
    }
    if(notification.color) {
      xcs_notif.color(notification.color);
    }
    xcs_notif.build();

    var xcs_message = new Message(notification.messageId+'')
      .priority(notification.priority === 'high' ? 2 : 1)
      .timeToLive(notification.getTimeToLiveInSecondsFromNow())
      .collapseKey(notification.collapseKey)
      .dryRun(notification.dryRun || false)
      .delayWhileIdle(notification.delayWhileIdle || false)
      .deliveryReceiptRequested(true)
      .addData("message", notification.message)
      .addData("messageId", notification.messageId)
      .addData("deviceId", notification.deviceId)
      .addData("androidBadge", notification.androidBadge)
      .addData("trackId", notification.trackId);

    if(notification.messageIcon) {
      xcs_message.notification(xcs_notif)
    }
    xcs_message.build();


    self._connection.sendNoRetry(xcs_message, token, function(result){
      if (result.getError()) {
        var err = result.getError();
        debug('Failed to send message: ', err, result.getFrom());
        if( err === 'DEVICE_UNREGISTERED' ) {
          self.emit('devicesGone', [result.getFrom()]);
        }
        var notif = self._createMessage(notification);
        // notif.message_id = notification.messageId;
        notif.message_id = result.getMessageId();
        self.emit('transmissionError', new Error(err), notif, result.getFrom());
      } else {
        debug('sent gcm to', token, ' message_id: ', result.getMessageId());
        self.emit("transmitted", self._createMessage(notification), result.getMessageId());
      }
    });
  });
};

// GcmCcsProvider.prototype._createMessage = function(notification) {
//   return notification;
// };
