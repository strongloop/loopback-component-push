// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var g = require('strong-globalize')();

var inherits = require('util').inherits;
var extend = require('util')._extend;
var EventEmitter = require('events').EventEmitter;
var gcm = require('node-gcm');
var debug = require('debug')('loopback:component:push:provider:gcm');

function GcmProvider(pushSettings) {
  var settings = pushSettings.gcm || {};
  this._setupPushConnection(settings);
}

inherits(GcmProvider, EventEmitter);

exports = module.exports = GcmProvider;

GcmProvider.prototype._setupPushConnection = function(options) {
  debug('Using GCM Server API key %j', options.serverApiKey);
  this._connection = new gcm.Sender(options.serverApiKey);
};

GcmProvider.prototype.pushNotification = function(notification, deviceToken) {
  var self = this;

  var registrationIds = (typeof deviceToken == 'string') ?
    [deviceToken] : deviceToken;
  var message = this._createMessage(notification);

  debug('Sending message to %j: %j', registrationIds, message);
  this._connection.send(message, registrationIds, 3, function(err, result) {
    if (!err && result && result.failure) {
      var devicesGoneRegistrationIds = [];
      var errors = [];
      var code;
      result.results.forEach(function(value, index) {
        code = value && value.error;
        if  (code === 'NotRegistered' || code === 'InvalidRegistration') {
          debug('Device %j is no longer registered.', registrationIds[index]);
          devicesGoneRegistrationIds.push(registrationIds[index]);
        } else if (code) {
          errors.push(g.f('{{GCM}} error code: %s, deviceToken: %s',
            (code || 'Unknown'), registrationIds[index]));
        }
      });

      if (devicesGoneRegistrationIds.length > 0) {
        self.emit('devicesGone', devicesGoneRegistrationIds);
      }

      if (errors.length > 0) {
        err = new Error(errors.join('\n'));
      }
    }

    if (err) {
      debug('Cannot send message: %s', err.stack);
      self.emit('error', err);
      return;
    }

    debug('GCM result: %j', result);
  });
};

GcmProvider.prototype._createMessage = function(notification) {
  // Message parameters are documented here:
  //   https://developers.google.com/cloud-messaging/server-ref
  var message = new gcm.Message({
    timeToLive: notification.getTimeToLiveInSecondsFromNow(),
    collapseKey: notification.collapseKey,
    delayWhileIdle: notification.delayWhileIdle,
  });

  var propNames = Object.keys(notification);
  // GCM does not have reserved message parameters for alert or badge, adding them as data.
  propNames.push('alert', 'badge');

  propNames.forEach(function(key) {
    if (notification[key] !== null &&
        typeof notification[key] !== 'undefined') {
      message.addData(key, notification[key]);
    }
  });

  return message;
};
