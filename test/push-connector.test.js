// Copyright IBM Corp. 2013,2015. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';

var PushConnector = require('../lib/push-connector');

describe('PushConnector', function() {
  var app;

  beforeEach('create an application', function() {
    app = loopback();
  });

  beforeEach('register the push connector', function() {
    app.connector('loopback-component-push', PushConnector);
    app.dataSource('push', {
      name: 'push',
      connector: 'loopback-component-push',
      installation: 'Installation',
      notification: 'Notification',
      application: 'Application',
    });
  });

  it('should execute emitted listeners for push models', function() {
    var Push = loopback.createModel({
      name: 'Push',
    });

    var executed = false;
    Push.on('attached', function() {
      executed = true;
    });

    app.model(Push, {
      dataSource: 'push',
    });
    expect(executed).to.equal(true);
  });
});
