var path = require('path');
var loopback = require('loopback');

var app = loopback();
var db = require('./data-sources/db');

// Load & configure loopback-push-notification
var PushModel = require('../../index')(app, { dataSource: db });
var Application = PushModel.Application;
var Installation = PushModel.Installation;
var Notification = PushModel.Notification;


// LoopBack REST interface
var apiPath = '/api';
app.use(apiPath, loopback.rest());

// API explorer (if present)
var explorerPath = '/explorer';
var explorerConfigured = false;
try {
  var explorer = require('loopback-explorer');
  app.use(explorerPath, explorer(app, { basePath: apiPath }));
  explorerConfigured = true;
} catch(e){
  // ignore errors, explorer stays disabled
}

app.use(app.router);
app.use(loopback.static(path.join(__dirname, 'html')));
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.configure(function () {
  app.set('port', process.env.PORT || 3010);
});

// Add our custom routes
var badge = 1;
app.post('/notify/:id', function (req, res, next) {
  var note = new Notification({
    expirationInterval: 3600, // Expires 1 hour from now.
    badge: badge++,
    sound: 'ping.aiff',
    alert: '\uD83D\uDCE7 \u2709 ' + 'Hello',
    messageFrom: 'Ray'
  });

  PushModel.notifyById(req.params.id, note, function(err) {
    console.log('pushing notification to %j', req.params.id);
  });
  res.send(200, 'OK');
});

// Pre-register an application that is ready to be used for testing.
// You should tweak config options in ./config.js

var config = require('./config');

findOrCreateApp(function (err, appModel) {
  if (err) throw err;
  console.log('Application id: %j', appModel.id);

  // Start the LoopBack server
  startServer(function() {
    var url = 'http://127.0.0.1:' + app.get('port');
    console.log('The server is running at %s', url);
    console.log('REST API is available at %s%s', url, apiPath);
  });
});

//--- Helper functions ---

function findOrCreateApp(cb) {
  Application.find({
      where: { name: config.appName }
    },
    function(err, result) {
      if (err) cb(err);
      if (result.length > 0) {
        return cb(null, result[0]);
      }

      return registerApp(cb);
    }
  );
}

function registerApp(cb) {
  console.log('Registering a new Application...');
  // Hack to set the app id to a fixed value so that we don't have to change
  // the client settings
  Application.beforeSave = function(next) {
      this.id = 'loopback-push-notification-app';
      next();
  };
  Application.register(
    'strongloop',
    config.appName,
    {
      description: 'LoopBack Push Notification Demo Application',
      pushSettings: {
        apns: {
          certData: config.apnsCertData,
          keyData: config.apnsKeyData
          pushOptions: {
          },
          feedbackOptions: {
            batchFeedback: true,
            interval: 300
          }
        },
        gcm: {
          serverApiKey: config.gcmServerApiKey
        }
      }
    },
    function(err, app) {
      if (err) return cb(err);
      return cb(null, app);
    }
  );
}

function startServer(cb) {
  app.listen(app.get('port'), cb);
}
