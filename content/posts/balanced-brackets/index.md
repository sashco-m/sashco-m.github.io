---
title: "Tech Interview Question: Balanced Brackets"
date: 2022-10-10T10:44:22-04:00
draft: true
---

This is the first in a series of posts on technical questions I've been asked during interviews for software engineering internships. I've done dozens as part of UWaterloo's co-op system, and I'll be picking the most interesting to share with tips on solving them!

<!-- more -->

## Problem

Imagine you had a string consisting of 3 different types of brackets. They are:
```
{}, [], ()
```
Your task is to write an algorithm to determine if the string is "balanced": That is, does every opening bracket correspond to a closing bracket *at the same depth*.
Some examples:
```
({[]}), ()[]     :white_check_mark:
```
```
([)], ]          :x:
```

## Step 1:  Clarifying Questions & Edge Cases