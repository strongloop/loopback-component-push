
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var gcm = require('node-gcm-ccs');
var GcmProvider = require('./gcm');
var debug = require('debug')('loopback:component:push:provider:gcm-ccs');

function GcmCcsProvider(pushSettings) {
  var settings = pushSettings.gcm || {};
  this._setupPushConnection(settings);
}

inherits(GcmCcsProvider, EventEmitter);
inherits(GcmCcsProvider, GcmProvider);

exports = module.exports = GcmCcsProvider;

GcmCcsProvider.prototype._setupPushConnection = function(options) {
  debug('Using GCM-CCS Server API key %s & senderId %s', options.serverApiKey, options.senderId);
  var self = this;
  this._connection = gcm(options.senderId, options.serverApiKey);
  this._connection.on('message', function(messageId, from, category, data){
    debug('message ', messageId, from, category, data);
    self.emit('gcm-ccs-message', messageId, from, category, data);
  });
  this._connection.on('receipt', function(messageId, from, category, data){
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
    self.emit('error', err);
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
    self._connection.send( token, notification, options, function(err, messageId, to){
      if (err) {
        console.error('Failed to send message: ', err, messageId, to);
        if( err === 'DEVICE_UNREGISTERED' ) {
          self.emit('devicesGone', [to]);
        }
        var notif = self._createMessage(notification);
        notif.message_id = messageId;
        self.emit('transmissionError', new Error(err), notif, to);
      } else {
        debug('sent gcm to', to, ' message_id: ', messageId);
        self.emit("transmitted", self._createMessage(notification), messageId);
      }
    });
  });
};

// GcmCcsProvider.prototype._createMessage = function(notification) {
//   return notification;
// };
