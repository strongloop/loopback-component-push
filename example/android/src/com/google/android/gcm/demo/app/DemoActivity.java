/*
 * Copyright 2013 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.android.gcm.demo.app;

import java.io.IOException;

import android.app.Activity;
import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.strongloop.android.loopback.LocalInstallation;
import com.strongloop.android.loopback.Model;
import com.strongloop.android.loopback.RestAdapter;

/**
 * Main UI for the demo app.
 */
public class DemoActivity extends Activity {

    private static final int PLAY_SERVICES_RESOLUTION_REQUEST = 9000;

    /**
     * Substitute you own sender ID here. This is the project number you got
     * from the API Console, as described in "Getting Started."
     */
    String SENDER_ID = "Your-Sender-ID";

    /**
     * Substitute your own application ID here. This is the id of the
     * application you registered in your LoopBack server by calling
     * Application.register().
     */
    String LOOPBACK_APP_ID = "loopback-push-notification-app";

    /**
     * Tag used on log messages.
     */
    static final String TAG = "GCM Demo";

    TextView mDisplay;
    GoogleCloudMessaging gcm;
    Context context;

    String regid;
    String deviceId;

    @Override
    public void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.main);
        mDisplay = (TextView) findViewById(R.id.display);

        context = getApplicationContext();

        // Check device for Play Services APK.
        // If check succeeds, proceed with GCM registration.
        if (checkPlayServices()) {
            updateRegistration();
        } else {
            Log.i(TAG, "No valid Google Play Services APK found.");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Check device for Play Services APK.
        checkPlayServices();
    }


    /**
     * Updates the registration for push notifications.
     */
    private void updateRegistration() {
        gcm = GoogleCloudMessaging.getInstance(this);

        // 1. Grab the shared RestAdapter instance.
        final DemoApplication app = (DemoApplication) getApplication();
        final RestAdapter adapter = app.getLoopBackAdapter();

        // 2. Create LocalInstallation instance
        final LocalInstallation installation =  new LocalInstallation(context, adapter);

        // 3. Update Installation properties that were not pre-filled

        // Enter the id of the LoopBack Application
        installation.setAppId(LOOPBACK_APP_ID);

        // Substitute a real id of the user logged in this application
        installation.setUserId("loopback-android");

        // 4. Check if we have a valid GCM registration id
        if (installation.getDeviceToken() != null) {
            // 5a. We have a valid GCM token, all we need to do now
            //     is to save the installation to the server
            saveInstallation(installation);
        } else {
            // 5b. We don't have a valid GCM token. Get one from GCM
            // and save the installation afterwards.
            registerInBackground(installation);
        }
    }

    /**
     * Checks the device to make sure it has the Google Play Services APK. If
     * it doesn't, display a dialog that allows users to download the APK from
     * the Google Play Store or enable it in the device's system settings.
     */
    private boolean checkPlayServices() {
        final int resultCode = GooglePlayServicesUtil.isGooglePlayServicesAvailable(this);
        if (resultCode != ConnectionResult.SUCCESS) {
            if (GooglePlayServicesUtil.isUserRecoverableError(resultCode)) {
                GooglePlayServicesUtil.getErrorDialog(resultCode, this,
                        PLAY_SERVICES_RESOLUTION_REQUEST).show();
            } else {
                Log.i(TAG, "This device is not supported.");
                finish();
            }
            return false;
        }
        return true;
    }

    /**
     * Registers the application with GCM servers asynchronously.
     * <p>
     * Stores the registration ID in the provided LocalInstallation
     */
    private void registerInBackground(final LocalInstallation installation) {
        new AsyncTask<Void, Void, String>() {
            @Override
            protected String doInBackground(final Void... params) {
                try {
                    final String regid = gcm.register(SENDER_ID);
                    installation.setDeviceToken(regid);
                    return "Device registered, registration ID=" + regid;
                } catch (final IOException ex) {
                    Log.e(TAG, "GCM registration failed.", ex);
                    return "Cannot register with GCM:" + ex.getMessage();
                    // If there is an error, don't just keep trying to register.
                    // Require the user to click a button again, or perform
                    // exponential back-off.
                }
            }

            @Override
            protected void onPostExecute(final String msg) {
                mDisplay.append(msg + "\n\n");
                saveInstallation(installation);
            }
        }.execute(null, null, null);
    }

    /**
     * Saves the Installation to the LoopBack server and reports the result.
     * @param installation
     */
    void saveInstallation(final LocalInstallation installation) {
        installation.save(new Model.Callback() {

            @Override
            public void onSuccess() {
                final Object id = installation.getId();
                final String msg = "Installation saved with id " + id;
                Log.i(TAG, msg);
                mDisplay.append(msg + "\n\n");
            }

            @Override
            public void onError(final Throwable t) {
                Log.e(TAG, "Cannot save Installation", t);

                final String msg = "Cannot save device registration,"
                        + " will re-try when restarted.\n"
                        + "Reason: " + t.getMessage();
                mDisplay.append(msg + "\n\n");
            }
        });
    }

    // Send an upstream message.
    @Override
    protected void onDestroy() {
        super.onDestroy();
    }
}
