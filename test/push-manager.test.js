/* Copyright (c) 2013 StrongLoop, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var PushManager = require('../lib/push-manager.js');

var mockery = require('./helpers/mockery');

var expect = require('chai').expect;

var aDeviceToken = 'a-device-token';

describe('PushManager', function() {
  var manager;

  beforeEach(mockery.setup);
  beforeEach(setupManager)
  afterEach(mockery.teardown);

  describe('iOS provider', function() {
    it('sends Notification as an APN message', function(done) {
      var provider = givenProvider('ios');

      var notification = aNotification({ aKey: 'a-value' });
      provider.push.pushNotification(notification, aDeviceToken);

      var apnArgs =  mockery.apn.firstPushNotificationArgs();
      expect(apnArgs[0].payload).to.deep.equal({ aKey: 'a-value' });
      expect(apnArgs[1]).to.equal(aDeviceToken);
      done();
    });
  });

  function setupManager() {
    manager = new PushManager();
  }

  function givenProvider(deviceType, pushSettings) {
    return manager.configureProvider(deviceType, pushSettings || {});
  }

  function aNotification(properties) {
    return new manager.Notification(properties);
  }
});
