//
//  apnListVC.m
//  apnagent
//
//  Created by George Paloukis on 15/2/13.
//  Copyright (c) 2013 Jake Luer. All rights reserved.
//

#import "apnListVC.h"
#import "apnDetailsVC.h"

@interface apnListVC ()

@property (nonatomic) PushNotification *selectedAPN;

@end

@implementation apnListVC

- (id)initWithStyle:(UITableViewStyle)style
{
  self = [super initWithStyle:style];
  if (self) {
    // Custom initialization
  }
  return self;
}

- (void)viewDidLoad
{
  [super viewDidLoad];
  
  // Initialize Data Source: pushNotifs;
  if (!self.pushNotifs)
    self.pushNotifs = [NSMutableArray arrayWithCapacity:5];
  
  // Uncomment the following line to preserve selection between presentations.
  // self.clearsSelectionOnViewWillAppear = NO;
  
  // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
  // self.navigationItem.rightBarButtonItem = self.editButtonItem;
}

- (void)viewDidAppear:(BOOL)animated {
  [self.tableView reloadData];
}

- (void)didReceiveMemoryWarning
{
  [super didReceiveMemoryWarning];
  // Dispose of any resources that can be recreated.
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
  // Return the number of sections.
  return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
  // Return the number of rows in the section.
  return self.pushNotifs.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
  static NSString *CellIdentifier = @"pushNotifCell";
  UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:CellIdentifier forIndexPath:indexPath];
  
  // Configure the cell
  PushNotification *pushNotif = [self.pushNotifs objectAtIndex:indexPath.row];
  
  // Alert message
  UILabel *label;
  label = (UILabel *)[cell viewWithTag:1];
  if ([[pushNotif.theUserInfo objectForKey:@"aps"] objectForKey:@"alert"]) {
    id theAlert = [[pushNotif.theUserInfo objectForKey:@"aps"] objectForKey:@"alert"];
    // Check if alert is just a string
    if ([theAlert isKindOfClass:[NSString class]])
      label.text = (NSString *)theAlert;
    else if ([theAlert isKindOfClass:[NSDictionary class]] && [(NSDictionary *)theAlert objectForKey:@"body"])
      label.text = [(NSDictionary *)theAlert objectForKey:@"body"];
  }
  
  // Push notif Type
  label = (UILabel *)[cell viewWithTag:2];
  switch (pushNotif.typeOfPN) {
    case PushNotifTypeBG:
      label.text = @"Background";
      break;
      
    case PushNotifTypeFG:
      label.text = @"Foreground";
      break;
      
    case PushNotifTypeTM:
      label.text = @"Terminated";
      break;
      
    default:
      break;
  }
  
  // Badge number
  label = (UILabel *)[cell viewWithTag:3];
  if ([[pushNotif.theUserInfo objectForKey:@"aps"] objectForKey:@"badge"]) {
    label.text = [NSString stringWithFormat:@"%@", [[pushNotif.theUserInfo objectForKey:@"aps"] objectForKey:@"badge"]];
  }
  
  // Sound or not 
  label = (UILabel *)[cell viewWithTag:4];
  if ([[pushNotif.theUserInfo objectForKey:@"aps"] objectForKey:@"sound"]) {
    label.alpha = 1.0;
  }
  
  return cell;
}

/*
 // Override to support conditional editing of the table view.
 - (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
 {
 // Return NO if you do not want the specified item to be editable.
 return YES;
 }
 */

/*
 // Override to support editing the table view.
 - (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath
 {
 if (editingStyle == UITableViewCellEditingStyleDelete) {
 // Delete the row from the data source
 [tableView deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationFade];
 }
 else if (editingStyle == UITableViewCellEditingStyleInsert) {
 // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
 }
 }
 */

/*
 // Override to support rearranging the table view.
 - (void)tableView:(UITableView *)tableView moveRowAtIndexPath:(NSIndexPath *)fromIndexPath toIndexPath:(NSIndexPath *)toIndexPath
 {
 }
 */

/*
 // Override to support conditional rearranging of the table view.
 - (BOOL)tableView:(UITableView *)tableView canMoveRowAtIndexPath:(NSIndexPath *)indexPath
 {
 // Return NO if you do not want the item to be re-orderable.
 return YES;
 }
 */

#pragma mark - Table view delegate
- (NSIndexPath *)tableView:(UITableView *)tableView willSelectRowAtIndexPath:(NSIndexPath *)indexPath {
  // Set the selected Room
  self.selectedAPN = [self.pushNotifs objectAtIndex:indexPath.row];
	
	return indexPath;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
  [tableView deselectRowAtIndexPath:indexPath animated:YES];
}

// Reset application's badge number
- (IBAction)resetBadge:(id)sender {
  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
}

// Reset application's badge number
- (IBAction)registerDevice:(id)sender {
    if(self.regDev)
        self.regDev();
}

- (void)addPushNotifWithType:(PushNotifType)pNType andUserInfo:(NSDictionary *)userInfo {
  PushNotification *aPushNotif = [[PushNotification alloc] init];
  
  aPushNotif.typeOfPN = pNType;
  aPushNotif.theUserInfo = userInfo;
  
  if (!self.pushNotifs)
    self.pushNotifs = [NSMutableArray arrayWithCapacity:5];
  [self.pushNotifs addObject:aPushNotif];
  [self.tableView reloadData];
  
  NSLog(@"Push Notification added, Type: %d, PushArray count: %luu, UserInfo: %@", aPushNotif.typeOfPN, (unsigned long)self.pushNotifs.count, aPushNotif.theUserInfo);
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
  if ([segue.identifier isEqualToString:@"ShowPayloadDetailsView"]) {
    apnDetailsVC *detailsVC = (apnDetailsVC *)segue.destinationViewController;
    detailsVC.thePN = self.selectedAPN;
  }
}

@end
