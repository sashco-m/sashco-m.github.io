---
title: "Canadian Telecom Horror Story"
date: 2023-12-27T13:19:21Z
tags: ["life", "business"]
---

While looking through boxing day phone plan deals, I remembered that it's been about a year since having the worst experience imaginable with Rogers. This story is uniquely terrible in that they took advantage of an old lady and were unable to find and fix the problem for weeks. 

<!--more-->

# Background
My landlady is in her mid 80's. Despite this she understands technology better than you'd think. She jumps between providers to try and get better and better deals on the plans they offer. After the Summer 2022 Rogers outage, she switched to Bell. However, a few months later she switched backed to Rogers after being offered a suspiciously good deal.

# Problems emerge
After switching back to Roger's Phone/TV/Internet bundle, the home phone did not work. After many calls and visits from repair people, they were unable to get the phone working. 

At this point we had 2 Roger's modems: the new white modem and the old gray modem. After about 2 weeks my landlady got fed up and asked them to put the old hardware back in, which they did. This actually fixed the phone, but now the internet was sluggish and mostly unusable. As in, some sites like YouTube would work and others wouldn't, and speed was capped at around 5mbps on a supposedly 300mbps plan.

# Unraveling the mystery
After more calls to Rogers and repair visits, one of them managed to find our issue. My landlady had somehow managed to have 2 accounts created with Rogers. 

One account (the old one, linked to the old hardware) was registered to our address and had just the home phone plan. A second account (new, created when she switched) was registered to her NEIGHBOURS address and had the tv/internet. 

In fact, my landlady told me that when the guy came to install the new modem, he showed up at her neighbours house. However, she saw him out the window and told him to come inside where he went ahead and installed it. How was this not a red flag to the install guy?

A sidenote about why the internet on the old device sort-of worked when it shouldn't have: I guess I accidentally found a flaw in Rogers' internet lines. If you're hooked up to their wires without paying for it, only ipv4 traffic is blocked. That's why Google sites like YouTube worked fine, since they all accept ipv6 traffic. (Hypothetically) You could use a free [nat64 gateway](https://nat64.net/) that translates all of your ipv4 traffic to ipv6 and do 95% of your internet tasks for free. 

# How did this happen?
My theory is that someone at the Rogers' store in Conestoga mall really wanted that commission even if it meant screwing over this old lady. They offered her a plan for new users despite her NOT being a new customer. To get around it, they just used her neighbours address (who would notice, right?) and told her how much money she would be saving. Absolutely crazy.

# Painful resolution
It culminated in a 9 hour phone call with Rogers support, right around exam time. I was bumped between 3-4 agents. However, at the end of the day they did manage to merge these 2 accounts and sign her up for a new plan (without the new customer discount). Now we were able to enjoy their $180/mo bundle. Sigh.

The worst part was that we had to figure all of this out ourselves. We had no idea Rogers' had these multiple accounts behind the scenes until a support agent stumbled upon it. It was like trying to figure out how an undocumented API works. That one repair guy was right, we should've just cancelled everything and started fresh.

This has taught me how NOT to run a business. 
- Have better tools for customer support. It should be obvious that there are 2 accounts for the same address! It should be easy for them to rectify!
- There should be more oversight of the people in these stores. A manager should have noticed that their sales guy is doing slimy things to get "new users". 
- The install guy should NOT install things at the wrong address! 

There were failures at so many levels. If you force your customers to fix problems you've created, they will jump ship as soon as they can.

Canadian Telecom Sucks.
