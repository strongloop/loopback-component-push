//
//  apnDetailsVC.m
//  apnagent
//
//  Created by George Paloukis on 26/3/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import "apnDetailsVC.h"

@interface apnDetailsVC ()

@end

@implementation apnDetailsVC

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
  [super viewDidLoad];
	// Set payload details textView
  self.payloadTxtView.text = self.thePN.userInfo.description;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewDidUnload {
  [self setPayloadTxtView:nil];
  [super viewDidUnload];
}
@end
