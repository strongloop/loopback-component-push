//
//  Notification list view controller
//
//  Created by George Paloukis on 15/2/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <LoopBack/LoopBack.h>

typedef void (^RegisterBlock)();

@interface NotificationListVC : UITableViewController

@property (nonatomic, strong) RegisterBlock regDev;
@property (nonatomic) NSMutableArray *pushNotifs;

- (IBAction)resetBadge:(id)sender;
- (IBAction)registerDevice:(id)sender;

- (void)addPushNotification:(LBPushNotification *)notification;

@end
