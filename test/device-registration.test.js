// Copyright IBM Corp. 2013,2018. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
const assert = require('assert');
const loopback = require('loopback');

const ds = loopback.createDataSource('db', {
  connector: loopback.Memory,
});
const PushConnector = require('../');
const Installation = PushConnector.Installation;
Installation.attachTo(ds);

describe('Installation', function() {
  let registration = null;

  it('registers a new installation', function(done) {
    const token =
      '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e ' +
      'f2a19241 e8f33305';
    Installation.create(
      {
        appId: 'MyLoopbackApp',
        appVersion: '1',
        userId: 'raymond',
        deviceToken: token,
        deviceType: 'ios',
        created: new Date(),
        modified: new Date(),
        status: 'Active',
      },
      function(err, result) {
        if (err) {
          console.error(err);
          done(err, result);
          return;
        } else {
          const reg = result;
          assert.equal(reg.appId, 'MyLoopbackApp');
          assert.equal(reg.userId, 'raymond');
          assert.equal(reg.deviceType, 'ios');
          assert.equal(reg.deviceToken, token);

          assert(reg.created);
          assert(reg.modified);

          registration = reg;

          Installation.findByApp('ios', 'MyLoopbackApp', function(
            err,
            results
          ) {
            assert(!err);
            assert.equal(results.length, 1);
            const reg = results[0];
            assert.equal(reg.appId, 'MyLoopbackApp');
            assert.equal(reg.userId, 'raymond');
            assert.equal(reg.deviceType, 'ios');
            assert.equal(reg.deviceToken, token);
            done(err, results);
          });
        }
      }
    );
  });
});
