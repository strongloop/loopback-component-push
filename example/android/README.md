You will need to setup your project to use the
Google Play Services library as described here:

http://developer.android.com/google/play-services/setup.html

To run this application, you must have a Sender ID
and a GCM server. For details, see:

http://developer.android.com/google/gcm/gs.html

Enter your Sender ID (Project Number) as the value of `SENDER_ID` field in
```
src/com/google/android/gcm/demo/app/DemoActivity.java
```

You can use `gcm-loopback.js` in the parent folder as a GCM server. Do not
forget to enter your API key into the `serverKey` property.
