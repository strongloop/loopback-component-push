//
//  PushNotification.h
//  apnagent
//
//  Created by George Paloukis on 18/2/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import <Foundation/Foundation.h>

/*!
 @typedef PushNotifType enum
 
 @abstract Push Notification Type: Indicates in what state was app when received it (Foreground, Background, Terminated)
 
 @discussion
 */
typedef enum PushNotifType {
  /*! App was on Foreground */
  PushNotifTypeFG   = 1,
  /*! App was on Background */
  PushNotifTypeBG   = 2,
  /*! App was terminated and launched again through Push notification */
  PushNotifTypeTM   = 3
} PushNotifType;

@interface PushNotification : NSObject

@property (nonatomic) PushNotifType typeOfPN;
@property (nonatomic) NSDictionary *theUserInfo;

@end
