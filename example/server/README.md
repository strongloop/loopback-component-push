This is an example LoopBack application for sending mobile push notifications.
Please see the full documentation: [Creating push notifications](http://docs.strongloop.com/display/DOC/Creating+push+notifications).

It is intended to work with the example [iOS app](../ios/) and example [Android app](../android/).

To run this LoopBack application:

    cd example/server
    node app

Open your browser to [http://127.0.0.1:3010](http://127.0.0.1:3010).

By default, the app uses an in-memory store for the application/installation data.
To change to a MongoDB instance, set the MONGODB environment variable to the MongoDB URL. For example,

    MONGODB=mongodb://localhost/demo node app
