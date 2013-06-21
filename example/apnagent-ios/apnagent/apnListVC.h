//
//  apnListVC.h
//  apnagent
//
//  Created by George Paloukis on 15/2/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PushNotification.h"

@interface apnListVC : UITableViewController

@property (nonatomic) NSMutableArray *pushNotifs;

- (IBAction)resetBadge:(id)sender;

- (void)addPushNotifWithType:(PushNotifType)pNType andUserInfo:(NSDictionary *)userInfo;

@end
