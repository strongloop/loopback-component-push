//
//  apnListVC.h
//  apnagent
//
//  Created by George Paloukis on 15/2/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PushNotification.h"

typedef void (^RegisterBlock)();

@interface apnListVC : UITableViewController

@property (nonatomic, strong) RegisterBlock regDev;
@property (nonatomic) NSMutableArray *pushNotifs;

- (IBAction)resetBadge:(id)sender;
- (IBAction)registerDevice:(id)sender;


- (void)addPushNotifWithType:(PushNotifType)pNType andUserInfo:(NSDictionary *)userInfo;

@end
