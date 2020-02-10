// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-component-push
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

'use strict';
const expect = require('chai').expect;
const loopback = require('loopback');

const ds = loopback.createDataSource('db', {
  connector: loopback.Memory,
});

// Application
const Application = loopback.Application;
Application.attachTo(ds);

// Push Connector
const PushConnector = require('../');
const PushModel = PushConnector.createPushModel({
  dataSource: ds,
});

// Installation
const Installation = PushConnector.Installation;
Installation.attachTo(ds);

describe('PushNotification', function() {
  it('registers a new installation', function(done) {
    // Sign up an application
    Application.register(
      'test-user',
      'TestApp',
      {
        description: 'My test mobile application',
        pushSettings: {
          apns: {
            token: {
              keyId: 'key_id',
              key: 'test/fixtures/APNs_token_key.p8',
              teamId: 'team_id',
            },
            bundle: 'ch.test.app',
          },
        },
      },
      function(err, result) {
        if (err) {
          throw err;
        }

        const application = result;
        const deviceToken =
          '6676119dc1ee264f7a32429c56c4e51b0a8b5673d1' +
          'd55c431d720bb60b0381d3';

        Installation.destroyAll(function(err, result) {
          // console.log('Adding a test record');
          Installation.create(
            {
              appId: application.id,
              userId: 'raymond',
              deviceToken: deviceToken,
              deviceType: 'ios',
              created: new Date(),
              modified: new Date(),
              status: 'Active',
            },
            function(err, result) {
              if (err) {
                console.error(err);

                throw err;
              } else {
                expect(result.userId === 'raymond');
                expect(result.deviceToken === deviceToken);
                expect(result.deviceType === 'ios');

                done();
              }
            }
          );
        });
      }
    );
  });
});
