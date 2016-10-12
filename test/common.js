// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

/* exported global */
global.chai = require('chai');
global.should = require('chai').should();
global.expect = require('chai').expect;
global.AssertionError = require('chai').AssertionError;
global.loopback = require('loopback');
global.assert = require('assert');

global.sinon = require('sinon');

global.ds = global.loopback.createDataSource('db', {
  connector: global.loopback.Memory,
});

global.Application = global.loopback.Application;
global.Application.attachTo(global.ds);

global.PushConnector = require('../');
global.Installation = PushConnector.Installation;
global.Installation.attachTo(global.ds);

global.Notification = PushConnector.Notification;
global.Notification.attachTo(global.ds);
