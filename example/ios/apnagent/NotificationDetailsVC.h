//
//  Notification details view controller
//
//  Created by George Paloukis on 26/3/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <LoopBack/LoopBack.h>

@interface NotificationDetailsVC : UIViewController

@property (nonatomic) LBPushNotification *thePN;

@property (weak, nonatomic) IBOutlet UITextView *payloadTxtView;

@end
