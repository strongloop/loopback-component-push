//
//  AppDelegate.m
//  apnagent
//
//  Created by Jake Luer on 1/11/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import "AppDelegate.h"
#import <LoopBack/LoopBack.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    self.settings = [self loadSettings];
    
    // Instantiate the shared LBRESTAdapter. In most circumstances, you'll do this only once; putting that reference in a
    // singleton is recommended for the sake of simplicity. However, some applications will need to talk to more than one
    // server - create as many Adapters as you need.
    self.adapter = [LBRESTAdapter adapterWithURL:[NSURL URLWithString:self.settings[@"RootPath"]]];

    // Reference to Push notifs List VC
    self.pnListVC = (NotificationListVC *)[[(UINavigationController *)self.window.rootViewController viewControllers]
                                           objectAtIndex:0];
  
    LBPushNotification* notification = [LBPushNotification application:application
                                         didFinishLaunchingWithOptions:launchOptions];
    
    // Handle APN on Terminated state, app launched because of APN
    if (notification) {
        NSLog(@"Payload from notification: %@", notification.userInfo);
        [self.pnListVC addPushNotification:notification];
    }
    
    return YES;
}
            
- (void)applicationWillResignActive:(UIApplication *)application
{
    // Sent when the application is about to move from active to inactive state. This can occur for certain types
    // of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the
    // application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should
    // use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application
    // state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate:
    // when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    // Called as part of the transition from the background to the inactive state; here you can undo many of the
    // changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application
    // was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    // Called when the application is about to terminate. Save data if appropriate. See also
    // applicationDidEnterBackground:.
}

- (void)application:(UIApplication*)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData*)deviceToken
{
    __unsafe_unretained typeof(self) weakSelf = self;
    
    // Register the device token with the LoopBack push notification service
    [LBPushNotification application:application
didRegisterForRemoteNotificationsWithDeviceToken:deviceToken
                            adapter:self.adapter
                             userId:@"anonymous"
                      subscriptions:@[@"all"]
                            success:^(id model) {
                                LBInstallation *device = (LBInstallation *)model;
                                weakSelf.registrationId = device._id;
                            }
                            failure:^(NSError *err) {
                                NSLog(@"Failed to register device, error: %@", err);
                            }
     ];
    
    SLSuccessBlock successBlock = ^(id model) {
        LBInstallation *device = (LBInstallation *)model;
        weakSelf.registrationId = device._id;
        NSString *msg = [NSString stringWithFormat:@"Device is registered: %@", device._id];
        UIAlertView *alert = [[UIAlertView alloc] initWithTitle: @"Device Registration"
                                                        message: msg
                                                       delegate: nil
                                              cancelButtonTitle:@"OK"
                                              otherButtonTitles:nil];
        [alert show];
        
    };

    self.pnListVC.regDev = ^ {
        if(deviceToken) {
            [LBInstallation registerDeviceWithAdapter:weakSelf.adapter
                                          deviceToken:deviceToken
                                       registrationId:weakSelf.registrationId
                                                appId:weakSelf.settings[@"AppId"]
                                           appVersion:weakSelf.settings[@"AppVersion"]
                                               userId:nil
                                                badge:@1
                                        subscriptions:nil
                                              success:successBlock
                                              failure:^(NSError *err) {
                                                  NSLog(@"Failed to register device, error: %@", err);
                                              }
             ];
        }
    };
}

- (void)application:(UIApplication*)application didFailToRegisterForRemoteNotificationsWithError:(NSError*)error {
    // Handle errors if it fails to receive the device token
	[LBPushNotification application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
    // Receive push notifications
    LBPushNotification* notification = [LBPushNotification application:application
                                          didReceiveRemoteNotification:userInfo];
    [self.pnListVC addPushNotification:notification];
}

- (NSDictionary *)loadSettings {
    NSString *path = [[[NSBundle mainBundle] bundlePath] stringByAppendingPathComponent:@"Settings.plist"];
    return [NSDictionary dictionaryWithContentsOfFile:path];
}

@end
