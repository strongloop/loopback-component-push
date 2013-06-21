# apnagent for iOS

_apnagent-ios_ is an iOS application that has been developed for use with the [Node.js](http://nodejs.org)
module [apnagent](https://github.com/qualiancy/apnagent) to facilitate testing and demonstration. It can
be used to test any APN server-side tool.

## Usage

This assumes that you have created a new application in your iOS provisioning portal.

**1. Clone:** Clone a copy of `apnagent-ios`.

    git clone git@github.com:logicalparadox/apnagent-ios.git

**2. xCode Configure:** Open the project in xCode and specify the `BUNDLE_ID`. Select Project > Build Settings, then
from the bottom right corner click Add Build Setting > Add User-Defined Setting. The key is `BUNDLE_ID` and the value
will be the application's bundle ID as specified in the iOS Provisioning portal. For example: `com.logicalparadox.apnagent`.

**3. Build/Run:** Run the application on your device. APNs notification cannot be sent to the simulator. Your APN token
will be logged to the console. Then use the server-side framework of your choice to send notifications to your device.

## License

(The MIT License)

Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
