2016-12-21, Version 3.0.0
=========================

 * Update paid support URL (Siddhi Pai)

 * add: HTTP2 APNS (Ilir Nuhiu)

 * Fix timeout in tests on Windows (Miroslav Bajtos)

 * Drop support for Node v0.10 & v0.12 (Miroslav Bajtoš)

 * Start the development of the next major version (Miroslav Bajtoš)

 * Remove Gruntfile and grunt deps (Miroslav Bajtoš)

 * Update README.md (Simon Ho)

 * Use eslint in favour of JSHint (#129) (Simon Ho)

 * Update translation files - round#2 (Candy)

 * Add translated files (gunjpan)

 * Update deps to LB 3.0.0 RC (Miroslav Bajtoš)

 * Use loopback@3.0.0-alpha for running the tests. (Miroslav Bajtoš)


2016-09-09, Version 1.6.0
=========================

 * Fix alert and badge not included in GCM (Benjamin Boudreau)

 * Update strong-globalize to 2.6.2 (Simon Ho)

 * Update strong-globalize to 2.6.0 (Simon Ho)

 * Globalization cleanup (Simon Ho)

 * Add globalization (Simon Ho)

 * Update URLs in CONTRIBUTING.md (#115) (Ryan Graham)

 * Upgrading dependencies (Benjamin Boudreau)


2016-05-03, Version 1.5.4
=========================

 * update copyright statements (Ryan Graham)

 * re-license as Artistic-2.0 only (Ryan Graham)


2016-02-19, Version 1.5.3
=========================

 * Remove sl-blip from dependencies (Miroslav Bajtoš)

 * Remove dependency on loopback-testing (Simon Ho)


2015-12-29, Version 1.5.2
=========================

 * Remove examples (Simon Ho)

 * Refer to licenses with a link (Sam Roberts)

 * Upgrade LB Explorer and related changes (crandmck)

 * Use strongloop conventions for licensing (Sam Roberts)

 * Fix iOS sample app's push registration handling Changes introduced by PR #67 should have been done in loopback-sdk-ios rather than inside the app. Those changes has been moved to loopback-sdk-ios (PR #38) and this PR removes them from the sample. This fixes Issue #75. Add MobileCoreServices and SystemConfiguration frameworks that are needed for the recent SDK. (hideya kawahara)

 * adding jscs and jshint to the pretest with jsdocs updates (Bryan Clark)

 * downgrade to node-cache@2.1.1 (Bryan Clark)

 * Forward "contentAvailable" and "urlArgs" to APNS (Jonathon Mah)

 * Update deps (Raymond Feng)

 * Fix links to example (Rand McKinney)

 * Update README.md (DeniseLee)

 * Style changes and edits. (DeniseLee)


2015-04-12, Version 1.5.1
=========================

 * Add the missing require statement (Raymond Feng)


2015-04-09, Version 1.5.0
=========================

 * Fix the package.json (Raymond Feng)

 * update module to loopback 2.0 (Bryan Clark)

 * update the example/server-2.0 demo (Bryan Clark)

 * Update notification.js (Rand McKinney)


2015-03-11, Version 1.4.4
=========================

 * Fix API doc and add Notification properties per #69 (crandmck)


2015-03-04, Version 1.4.3
=========================

 * Fix for iOS8 category parameter (Andrej Šinigoj)

 * Support ios notification app on iOS8 version (xcode 6) (Vine Brancho)

 * Fix a build error from xcode (Vine Brancho)

 * Update README.md (Rand McKinney)

 * Typo (Rand McKinney)

 * Added keywords (Rand McKinney)

 * Fix bad CLA URL in CONTRIBUTING.md (Ryan Graham)

 * Cleanup CHANGES.md (ariskemper)

 * Fix to GCM provider "devicesGone" test (Andrej Šinigoj)

 * Update gcm.js (Andrej Šinigoj)


2014-12-02, Version 1.4.2
=========================

 * Add gcm response handling for multiple device tokens, tests (Aris Kemper)

 * Fix the order of routes (Raymond Feng)


2014-11-27, Version 1.4.1
=========================



2014-11-05, Version 1.4.0
=========================

 * Bump version (Raymond Feng)

 * Add applications cache, settings ttlInSeconds, checkPeriodInSeconds, tests (Aris Kemper)

 * Add contribution guidelines (Ryan Graham)

 * Updated doc link (Rand McKinney)


2014-09-15, Version 1.3.1
=========================

 * Bump version (Raymond Feng)

 * Fix the push config (Raymond Feng)

 * Fixed issue#47: Creating a submodel for Installation breaks find* methods (Timo Saikkonen)

 * Add LoopBack 2.0 version of push server (Raymond Feng)


2014-08-03, Version 1.3.0
=========================

 * Bump version (Raymond Feng)

 * Ensure deviceType/token are populated from installation (Raymond Feng)

 * Upgrade to apn version 1.6.0. (ariskemper)

 * Fix gcm pushNotification and add test case for array of device tokens. Signed-off-by: Aris Kemper <aris.github@gmail.com> (Aris Kemper)

 * Fix gcm pushNotification and add test case for array of device tokens. (Aris Kemper)

 * Add fixes to notifyMany and tests. (Aris Kemper)

 * Push notification to many installations (ariskemper)

 * push notification to many devices support (ariskemper)


2014-07-22, Version 1.2.3
=========================

 * Remove the peer dep to loopback (Raymond Feng)


2014-07-01, Version 1.2.2
=========================

 * Update deps (Raymond Feng)

 * Rename loopback-push-notification to loopback-component-push (Raymond Feng)

 * Update link to doc (Rand McKinney)


2014-06-10, Version 1.2.1
=========================

 * gcm: fix `devicesGone` event (Andrej Šinigoj)

 * Update the Apple credentials and app id (Raymond Feng)

 * Update apns.js (Daehyeon Shin)

 * Add missing mongodb dep (Raymond Feng)

 * Update the deps (Raymond Feng)


2014-02-21, Version 1.2.0
=========================

 * Bump version and update deps (Raymond Feng)

 * Update license to dual Artistic-2.0/StrongLoop (Raymond Feng)

 * Encode the id for urls (Raymond Feng)


2014-02-11, Version 1.1.1
=========================

 * Fix the version (Raymond Feng)

 * Update dependencies (Raymond Feng)

 * Replace example/server with example/demo-server (Raymond Feng)

 * Move the cleanup to beforeEach/afterEach (Raymond Feng)

 * Use dynamic properties for dependencies (Raymond Feng)

 * Fix typo (Raymond Feng)

 * Improve the UI (Raymond Feng)

 * Fix the push data source configuration (Raymond Feng)

 * Upgrade Bootstrap and Angular (Raymond Feng)

 * Add simple UI to manage applications (Raymond Feng)

 * Fix the demo app (Raymond Feng)


2014-01-14, Version 1.1.0
=========================

 * Bump the version to 1.1.0 (Raymond Feng)

 * Add the demo server from loopback-workspace (Raymond Feng)

 * Export the default Push model (Raymond Feng)

 * Bump version (Raymond Feng)

 * Fix the test case (Raymond Feng)

 * Refactor to support loopback mobile template (Raymond Feng)

 * Fix the resetBadge (Raymond Feng)

 * Fix link to docs after splitting article. (Rand McKinney)

 * Create README.md (Rand McKinney)

 * Minor rewording and better links to examples. (Rand McKinney)

 * Clean up main README and add links to docs (Rand McKinney)

 * Minor cleanup (Rand McKinney)

 * Add ref to original repo (Rand McKinney)

 * Replace old README with links to docs. (Rand McKinney)

 * example: Use more sensible default values (Miroslav Bajtoš)

 * Update README.md (Rand McKinney)

 * example/android: update LoopBack Android SDK (Miroslav Bajtoš)


2014-01-08, Version 1.0.0
=========================

 * First release!
