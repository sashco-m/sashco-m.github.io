---
title: "SpinOk Android Spyware found in 101 apps with 421 million downloads"
date: 2023-06-08T19:04:59-04:00
tags: ["software", "security"]
---

I originally wrote this article for my computer security and privacy class (CS458). SpinOk is an interesting case of a spyware trojan fooling not the end user, but developers into including it in their projects. 

<!--more-->

Suppose you wanted to splice together some videos on your phone. You have the choice between a paid video-editor app for $4.99, and a free one with ads. Both have good reviews and millions of downloads. Which one would you pick?

Now, if this free app contained SpinOk, an advertising SDK used by hundreds of Android apps, then the "cheap" option would cost your privacy. In a recent report by Dr Web, the SpinOk SDK contains several spyware capabilities, including sending file and clipboard contents to a remote C&C (Command and Control) server [1]. This makes SpinOk what I'll call a "double-layered Trojan". It first presents itself as a harmless marketing SDK to drive user engagement with minigames, tasks and rewards [1]. It dupes a developer into including this SDK in their app, unaware of the extra information it collects. This inadvertently makes their own legitimate app a Trojan, to then be downloaded by millions of unsuspecting users.

## Why is it important?
The most damaging aspect is the sheer scale of the users affected. It was originally reported to affect 101 apps, with total downloads in excess of 421 million [1]. However, a newer report by Heimdal Security has found an additional 92 apps with the same malicious SDK, bringing the total to 193 [3]. In addition, the information collected could be equally damaging. Passwords are very commonly copy-pasted. Users of password managers (... like myself) _must_ copy-paste their long, convoluted and supposedly "secure" passwords. So ironically, they may be the most susceptible to this attack. As well, this SDK has the ability to list the files on the device, and view the file contents. We would hope any sensitive data would be encrypted by the system, so this may not be as useful. However, it is still information that we certainly do not want them to have! Finally, this exposes some poor practices from both the developers and the Google Play store. For a developer to incorporate this SDK in their app, they did one of two things. They may have simply trusted the SDK and did not test it deeply themselves. This is most likely, since the SDK does have a legitimate purpose. Or, they knew about the excessive amounts of data the SDK could collect from the user's device and did not care. Neither are a good look. As well, it highlights Google's lacklustre review process in ensuring apps do not compromise user privacy.

## Who is affected?
According to Dr Web, some of the largest apps include [1]:
- Noizz,a video editor app with over 100 million downloads
- Zapya, a file transfer app with over 100 million downloads

Any user who had these apps installed and were greeted by the advertisement screen had their device information sent to SpinOk's Command and Control Server.

## What impact might it have
I am speculating about the possible impact, since the vulnerability was found so recently, we don't know the exact impact. It certainly damages users' perception of security within the Gogle Play store. At the end of the day, Google is the notable name that people will remember. The development team can always change their name and can likely avoid most of the public backlash. In addition, there is a real possibility for stolen credentials, as mentioned earlier with reading the clipboard contents. Finally, we know about how advertising agencies can build a profile about you by collecting things like location data and purchase history. The device information that is stolen by SpinOk could be used to augment these advertising profiles, further reducing ones privacy. An shortened example of the data (shown below) is from Dr Web's investigation [2].

```json
{
   ...
   "lcountry":"US",
   "battery":100,
   "btch":1,
   "lowp":0,
   "btime":*,
   "fm":*,
   "ram":6893047520,
   "vpn":0,
   "igp":1,
   "gcy":"*",
   "cdid":"",
   "mac":"",
   "ssd":"*",
   "android":{
      "device":"*",
      "product":"*",
      "screen_density":2,
      "screen_size":2,
      "cpu_abi":"arm64-v8a",
      "cpu_abi2":"",
      "cpu_abilist":"arm64-v8a,armeabi-v7a,armeabi",
      ... 
      "sensor_size":30,
      "sensors":[
         {
            "sT":2,
            "sN":"LSM6DSO Accelerometer",
            "sV":"STMicro",
	    ...
         },
         {
            "sT":2,
            "sN":"AK09918 Magnetometer",
            "sV":"akm",
            ...
         },
         {
            "sT":4,
            "sN":"LSM6DSO Gyroscope",
            "sV":"STMicro",
            ... 
         }
      ],
      "fb_id":"",
      "build":"*",
      "langname":"English"
   }
}
```
## What were the causes
A quick rundown of the how SpinOk operates comes from Dr Web [2]. It begins with a request to `https[:]//d3hdbjtb1686tn[.]cloudfront[.]net/gpsdk.html`, which returns the hostname of the Command and Control server. The SDK then makes a request to `{hostname}/init` with a large amount of device data, shown above. Notice that it includes sensor data, like the accelerometer, magnetometer, and gyroscope. The server uses this information to determine whether the device is being run in a sandbox or emulator, which it may use as an indicator to hide itself. This is the biggest admission of guilt in my opinion. Afterwards, the server returns a list of URL's for the app to display within a WebView. These WebViews have access to several Javascript methods including the copy-clipboard and read file capability discussed earlier.  

## How might similar problems be prevented in the future
I believe there is action to be taken from the Play Store, the developers, and the users. Google Play requires apps to go through a comprehensive review. An app must declare if they use Ads, and specifically if they use a 3rd party advertising SDK (like SpinOk) [4]. Google knows what SDK's these apps are using, and should put them under a fine-tooth comb. A vulnerability in a library used by thousands of apps is much more damaging than a vulnerability that is contained within a single app. Second, ignorance is no excuse for the developers. Personally, I would expect fines, bans, or some type of punishment for the companies who publish these vulnerable apps. But at the same time, Google did sign-off on them, so they are implicated too. All developers should thoroughly review all 3rd party SDKs and libraries that they use. I would suggest using a service like Snyk that automatically scans dependencies for vulnerabilities [5]. Finally, users should be weary of installing free apps. They should read reviews and comments carefully. However, since both of these can be altered via networks of bots, it is not completely foolproof. The truth is, it's hard for the average user to determine what is malicious and what isn't.

## Discussion Questions
- Many of the apps using SpinOk had a high number of users, and good reviews (ex. Noizz, with 100M downloads and 4.1 stars). Is the average user worried about spyware within seemingly-reputable apps? Should they be? 
- Does news of SpinOk make you think twice about downloading seemingly-reputable ad-supported apps? Why or why not? How do you determine what is reputable?
- What sort of failures were made by the developers to allow this Trojan SDK into their apps? How could they be corrected?
- Who is to blame for allowing this spyware to end up in the hands of end users? Should anyone be punished? Who and how so?
- How can Google realistically ensure that apps on the Play Store do not contain spyware?

## References

[1] Doctor Web. (2023, May 25). Android apps containing spinok module with spyware features installed over 421,000,000 times. Dr.Web. https://news.drweb.com/show/?i=14705&amp;lng=en 

[2] Dr.web malware description libruary. Dr.Web. (n.d.). https://vms.drweb.com/search/?q=Android.Spy.SpinOk&amp;lng=en 

[3] Popovici, M. (2023, June 6). Spinok malware, discovered in 193 apps with over 451M installs. Heimdal Security Blog. https://heimdalsecurity.com/blog/spinok-malware-discovered-in-193-apps-with-over-451m-installs/ 

[4] Google. (n.d.). Prepare your app for review - play console help. Google. https://support.google.com/googleplay/android-developer/answer/9859455?hl=en 

[5] Developer security: Develop fast. stay secure. Snyk. (n.d.). https://snyk.io/ 
