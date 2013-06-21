var asteroid = require('asteroid')
    , app = module.exports = asteroid();

// expose a rest api
app.use(asteroid.rest());

app.use(asteroid.static('html'));

var model = require('../models/device-registration');
app.model(model);

model.destroyAll(function (err, result) {
    console.log('Adding a test record');
    model.create({
        appId: 'MyAsteroidApp',
        userId: 'MyAsteroidUser',
        deviceToken: '75624450 3c9f95b4 9d7ff821 20dc193c a1e3a7cb 56f60c2e f2a19241 e8f33305',
        deviceType: 'apns',
        created: new Date(),
        lastModified: new Date(),
        status: 'Active'
    }, function (err, result) {
        console.log('Registration record is created: ', result);
    });
});

// start the server
app.listen(3000);
console.log('Server is ready at http://127.0.0.1:3000/deviceRegistrations');
