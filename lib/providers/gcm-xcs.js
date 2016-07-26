
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
  var self = this;
  this._connection = Sender(options.senderId, options.serverApiKey);
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
  var options = {
    delivery_receipt_requested: true,
    priority: notification.priority || 'normal',
    collapse_key: notification.collapseKey,
    delay_while_idle: notification.delayWhileIdle,
    time_to_live: notification.getTimeToLiveInSecondsFromNow(),
    dry_run: notification.dryRun
  };

  targets.map( function(token){

    console.log('@@@@@@@@@@@@@@@@@@@@@@ ', notification, options);
    var xcs_notif = new Notification(notification.collapseKey)
      .title("Hello buddy!")
      .body("node-xcs is awesome.")
      .build();
    var xcs_message = new Message("messageId_1046")
      .priority(options.priority)
      .dryRun(notification.dryRun)
      .addData("node-xcs", true)
      .addData("anything_else", false)
      .addData("awesomeness", 100)
      .deliveryReceiptRequested(true)
      .notification(xcs_notif)
      .build();


    self._connection.sendNoRetry(xcs_message, token, function(result){
      if (result.getError()) {
        var err = result.getErrorDescription();
        debug('Failed to send message: ', err, token);
        if( err === 'DEVICE_UNREGISTERED' ) {
          self.emit('devicesGone', [token]);
        }
        var notif = self._createMessage(notification);
        notif.message_id = messageId;
        self.emit('transmissionError', new Error(err), notif, token);
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
