//
//  AppDelegate.h
//  apnagent
//
//  Created by Jake Luer on 1/11/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <LoopBack/LoopBack.h>
#import "NotificationListVC.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) NSNumber* registrationId;

@property (strong, nonatomic) UIWindow *window;

@property (strong, nonatomic) NotificationListVC *pnListVC;

// The shared LBRESTAdapter instance, configured by Settings.plist.
@property (strong, nonatomic) LBRESTAdapter *adapter;
@property (strong, nonatomic) NSDictionary *settings;

// Loads the values in Settings.plist.
- (NSDictionary *)loadSettings;

@end
