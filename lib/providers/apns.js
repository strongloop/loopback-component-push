// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var g = require('strong-globalize')();

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('loopback:component:push:provider:apns');
var apn = require('apn');

function ApnsProvider(pushSettings) {
  pushSettings = pushSettings || {};
  var settings = pushSettings.apns || {};
  var pushOptions = settings.pushOptions || {};
  var feedbackOptions = settings.feedbackOptions || {};

  // Populate the shared cert/key data
  if (settings.certData) {
    pushOptions.cert = pushOptions.certData || settings.certData;
    feedbackOptions.cert = feedbackOptions.certData || settings.certData;
  }
  if (settings.keyData) {
    pushOptions.key = pushOptions.keyData || settings.keyData;
    feedbackOptions.key = feedbackOptions.keyData || settings.keyData;
  }

  // Check the push mode production vs development
  if (settings.production) {
    pushOptions.production = true;
    feedbackOptions.production = true;

    // Always override
    pushOptions.gateway = 'gateway.push.apple.com';
    feedbackOptions.gateway = 'feedback.push.apple.com';
    if (pushOptions.port !== undefined) {
      pushOptions.port = 2195;
    }
    if (feedbackOptions.port !== undefined) {
      feedbackOptions.port = 2196;
    }
  } else {
    pushOptions.production = false;
    feedbackOptions.production = false;

    // Honor the gateway settings for testing
    pushOptions.gateway = pushOptions.gateway ||
      'gateway.sandbox.push.apple.com';
    feedbackOptions.gateway = feedbackOptions.gateway ||
      'feedback.sandbox.push.apple.com';
  }

  // Keep the options for testing verification
  this._pushOptions = pushOptions;
  this._feedbackOptions = feedbackOptions;

  this._setupPushConnection(pushOptions);
  this._setupFeedback(feedbackOptions);
}

inherits(ApnsProvider, EventEmitter);

exports = module.exports = ApnsProvider;

ApnsProvider.prototype._setupPushConnection = function(options) {
  debug('setting up push connection', options);
  var self = this;
  if (options && options.port === null) {
    options.port = undefined;
  }

  function errorHandler(err) {
    debug('Cannot initialize APNS connection. %s', err.stack);
    self.emit('error', err);
  }

  var connection;
  try {
    connection = new apn.Connection(options);
  } catch (e) {
    return errorHandler(e);
  }
  connection.on('error', errorHandler);
  connection.on('socketError', errorHandler);

  connection.on('transmissionError', function(code, notification, recipient) {
    var err = new Error(g.f('Cannot send {{APNS}} notification: %s', code));
    self.emit(err, notification, recipient);
  });

  this._connection = connection;
};

ApnsProvider.prototype._setupFeedback = function(options) {
  debug('setting up feedback connection', options);
  if (!options) {
    debug('Feedback channel is not enabled in the application settings.');
    return;
  }
  if (options && options.port === null) {
    options.port = undefined;
  }

  var self = this;

  function errorHandler(err) {
    debug('Cannot initialize APNS feedback. %s', err.stack);
    self.emit('error', err);
  }

  try {
    this._feedback = new apn.Feedback(options);
  } catch (e) {
    return errorHandler(e);
  }

  this._feedback.on('error', errorHandler);

  this._feedback.on('feedback', function(devices) {
    debug('Devices gone:', devices);
    self.emit('devicesGone', devices);
  });
};

ApnsProvider.prototype.pushNotification = function(notification, deviceToken) {
  // Note parameters are described here:
  //   http://bit.ly/apns-notification-payload
  var note = new apn.Notification();
  note.expiry = notification.getTimeToLiveInSecondsFromNow() || note.expiry;
  note.badge = notification.badge;
  note.sound = notification.sound;
  note.alert = notification.alert;
  note.category = notification.category;
  note.contentAvailable = notification.contentAvailable;
  note.urlArgs = notification.urlArgs;
  note.payload = {};

  Object.keys(notification).forEach(function(key) {
    note.payload[key] = notification[key];
  });

  debug('Pushing notification to %j:', deviceToken, note);
  this._connection.pushNotification(note, deviceToken);
};
