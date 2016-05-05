
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var gcm = require('node-gcm-ccs');
var debug = require('debug')('loopback:component:push:provider:gcm-ccs');

function GcmCcsProvider(pushSettings) {
  var settings = pushSettings.gcm || {};
  this._setupPushConnection(settings);
}

inherits(GcmCcsProvider, EventEmitter);

exports = module.exports = GcmCcsProvider;

GcmCcsProvider.prototype._setupPushConnection = function(options) {
  debug('Using GCM-CCS Server API key %j % senderId %s', options.serverApiKey, options.senderId);
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
  var message = this._createMessage(notification);
  debug('Sending message to %j: %j', targets, message);
  var options = {
    delivery_receipt_requested: true,
    priority: notification.priority || 'normal',
    collapse_key: notification.collapseKey,
    delay_while_idle: notification.delayWhileIdle,
    time_to_live: notification.getTimeToLiveInSecondsFromNow(),
    dry_run: notification.dryRun
  };

  targets.map( function(token){
    self._connection.send( token, message, options, function(err, messageId, to){
      if (err) {
        console.error('Failed to send GCM ', err, messageId, to);
        self.emit('devicesGone', token);
      } else {
        console.log('sent message to', to, 'with message_id =', messageId);
        self.emit("transmitted", message, messageId);
      }
    });
  });
};

GcmCcsProvider.prototype._createMessage = function(notification) {
  return notification;
};
