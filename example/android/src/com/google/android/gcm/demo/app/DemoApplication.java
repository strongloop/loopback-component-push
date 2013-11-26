package com.google.android.gcm.demo.app;

import android.app.Application;

import com.strongloop.android.loopback.RestAdapter;

public class DemoApplication extends Application {
    RestAdapter adapter;

    public RestAdapter getLoopBackAdapter() {
        if (adapter == null) {
            // Instantiate the shared RestAdapter. In most circumstances,
            // you'll do this only once; putting that reference in a singleton
            // is recommended for the sake of simplicity.
            // However, some applications will need to talk to more than one
            // server - create as many Adapters as you need.
            adapter = new RestAdapter(
                    getApplicationContext(),
                    "http://10.0.2.2:3010/api/");
        }
        return adapter;
    }

}
