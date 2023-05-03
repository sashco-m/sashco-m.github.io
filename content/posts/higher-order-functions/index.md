---
title: "Neat Higher-Order Function"
date: 2023-05-02T18:11:52-04:00
tags: ["software", "project", "books"]
---

While working on my [Chrome extension](https://chrome.google.com/webstore/detail/faceit-enhancer-enhancer/ljillbdcdanficginhgeioleejhdgjem?hl=en&authuser=0) project, I ran into [this](https://www.freecodecamp.org/news/javascript-debounce-example/) article on a technique called ['debouncing'](https://en.wikipedia.org/wiki/Switch#Debouncing). It uses a higher-order function to ensure that the function supplied is run only once per interval. It's inspired me to come up with my own to solve the problem of applying user settings. I also apply a lesson from the [Pragmatic Programmer](https://en.wikipedia.org/wiki/The_Pragmatic_Programmer)!

<!--more-->

## withSettings()
I'm expanding the extension to allow a user to set certain options inside the extension popup. These are stored using the 'chrome.storage.local' API, and need to be used by the background script. How can I provide these user settings without having a mess of checks and spaghetti requests?

Here's what I came up with:
```typescript
export const withSettings = async (f:(...args: any[]) => any, ...settings:string[]) => {
    return chrome.storage.local.get(settings)
    .then(settingsMap => {
        return (...args:any[]) => f.apply(this, [
            ...args,
            ...settings.map(setting => settingsMap[setting])
        ])
    })
    // Lesson from the pragmatic programmer
    //  Let it error -> what does catching this do for me?
}
```

There are many benefits to this. It's really DRY; we have the settings API call in one place *forever*. It abstracts away the connecting-the-dots that we don't care about. It also gives us a standard way of doing a common thing: a *pattern*. And (good) patterns are good! What I'm describing here is just a small example of [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection), which is all that 'withSettings()' is doing!

I also purposely don't add a catch block. I'm trying to learn and apply the rules from the [Pragmatic Programmer](https://en.wikipedia.org/wiki/The_Pragmatic_Programmer), specifically 'Crash Early' or 'Let it crash'. The idea is that once the program reaches an unsafe state, we should gracefully exit as soon as possible. This also discourages the anti-pattern of catching an error, only to log it and re-throw it. In this situation, if the chrome storage API fails, we've certainly reached an unsafe state.

The biggest downside is losing the type information of the base function. But, this may be possible to fix, and I just need to spend some more time with typescript.