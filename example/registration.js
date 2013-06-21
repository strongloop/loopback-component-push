var asteroid = require('asteroid')
    , app = module.exports = asteroid();

// expose a rest api
app.use(asteroid.rest());

var model = require('../models/device-registration');
app.model(model);

model.create({
    appId: 'MyAsteroidApp',
    userId: 'MyAsteroidUser',
    deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305',
    deviceType: 'apns',
    created: new Date(),
    lastModified: new Date(),
    status: 'Active'
}, function(err, result) {

});

// start the server
app.listen(3000);
