//
//  AppDelegate.h
//  apnagent
//
//  Created by Jake Luer on 1/11/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "apnListVC.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (strong, nonatomic) apnListVC *pnListVC;

@end
