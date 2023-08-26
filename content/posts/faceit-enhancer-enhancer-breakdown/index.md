---
title: "Project Breakdown: faceit-enhancer-enhancer"
date: 2023-08-26T13:49:15-04:00
tags: ['project', 'software', 'chrome extension']
---

I'm getting towards the end of my [chrome extension](https://chrome.google.com/webstore/detail/faceit-enhancer-enhancer/ljillbdcdanficginhgeioleejhdgjem) project. It uses the faceit data api to provide more detailed stats about the players in your lobby. There were interesting challenges at every turn, like scraping the dynamically-changing SPA or storing settings. I plan to give an overview of the design and insight into some of these hurdles.

<!--more-->

This article assumes basic familiarity with browser extensions, like what content/background scripts are.

# Tools
First briefly mentioning the tools, it's written entirely in typescript and uses Vue.js for the popup. Webpack is used to compile to javascript. Take a look at the [webpack config](https://github.com/sashco-m/faceit-enhancer-enhancer/blob/1bbeba4b91e663ae0d353ffaa6f75f3dabd3dd01/webpack/webpack.config.js) for details.

# Problem 1: Matching the match page
The first problem was figuring out when to run. Since the current page is dynamically re-written, we can't fully rely on the standard content script URL matching. Luckily, the match page is always reached through history.pushState(). We can listen to these events using the chrome api, look for the desired URL with regex, and send a message to the content script to begin step 2.

Here's the matching code:
```ts
/* Listens to onHistoryStateUpdated events, since we can reach the match page
 * via history.pushState().
 * This is how we tell the content script to get busy. 
 * 
*/
chrome.webNavigation.onHistoryStateUpdated.addListener(
    async (details:chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {

      console.log(`history updated: ${details.url}`)

      // matches URLs with /en/csgo/room/{uuid}
      if(!details.url.match('\/en\/csgo\/room\/[0-9a-zA-z\-]*$')) return

      // Send to all tabs, since multiple could have opened the match page
      chrome.tabs.query({}, tabs => {
        for(let tab of tabs){
          if(!tab.id)
            continue

          chrome.tabs.sendMessage(tab.id, {type:'waitForRosterLoad'})
        }
      })
    }
) 
```
# Problem 2: Finding the roster
We've determined we're on the correct page. We want to find all the players participating in the match (each roster). There is no guarantee that the roster has loaded yet. In fact, if we've lost network connection it may never load. So, we periodically scrape the page looking for HTML elements corresponding to the roster. We make sure it's on a timer so we don't loop forever. Once again, since this is an SPA, we can't rely on DOM events like DOMContentLoaded.

Here's a code snippet for the polling:
```ts
/* Listens to the background script for when to start looking for
 * the roster.
*/
chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
        if(request.type === 'waitForRosterLoad')
            waitForRosterLoad()
    }
)

const waitForRosterLoad = () => {
    
    function pollDOMForRoster () {
        console.log('searching...')

        // stop polling page
        clearInterval (timer);
        // 'roster1' and 'roster2' are convenient names
        let roster1 = getPlayersFromRoster("[name='roster1']")
        let roster2 = getPlayersFromRoster("[name='roster2']")
        if(!roster1 || !roster2){
            // set the poll 
            pollIfNotTimedOut() 
            console.log('error getting roster')
            return
        }
        // might as well clear the timeout
        clearTimeout(timeout)
        useIdFromMatchApi([...roster1, ...roster2]) 
    }

    // timers for roster load
    let timer = setInterval (pollDOMForRoster, 500)
    let timedOut = false
    const timeout = setTimeout(() => timedOut = true, 15000)
    const pollIfNotTimedOut = () => {
        if(timedOut){
            console.log('timed out') 
            return
        }
        timer = setTimeout(pollDOMForRoster, 500)
    }
}
```

We can see the function waitForRosterLoad() is activated by the message sent by the background script. It creates an interval that calls pollDOMForRoster() every 500ms. If it fails, we reset the interval unless the 15 second timeout has been reached. If it succeeds before the timeout, we run the main logic in useIdFromMatchApi().

# Problem 3: Getting stats
The URL of the match page contains its uuid. We can use the faceit api to get the user id's of each player in this match. For each user id, we send a message to the background script to compute the stats. We then use the roster we found in part 2 to know where to insert these stats. 

Details are explained in the snippets below:

```ts
const useIdFromMatchApi = (roster:ChildNode[]) => {
    // Use the match ID from the URL to get all player_id's in the lobby
    const match_id = window.location.pathname.split('/').slice(-1);

    (async () => {
        const rosterData = await chrome.runtime.sendMessage({type: "getMatchUsers", match_id})
        let nameToNode = userNameToUserNode(roster)

        for(let player of rosterData){
            // find the player by nickname
            let playerNode = nameToNode.get(player.nickname)
            if(!playerNode) continue

            // make sure it hasn't already been set
            if(playerNode.parentNode && hasBeenModified(playerNode.parentNode)) return

            // set a loading message
            const loadMsg = buildLoadingMessage()
            playerNode.appendChild(loadMsg);

            (async () => {
                const response = await chrome.runtime.sendMessage({type: "getUserStatsNew", player_id: player.player_id})
                // remove loadMsg
                playerNode.removeChild(loadMsg)
                if(!response){
                    const errMsg = buildErrorMessage(`Error fetching stats for: ${player.nickname}`)
                    playerNode.appendChild(errMsg)
                    return
                }
    
                playerNode.appendChild(buildStatsTable(response)) 
            })();
    
        }
    })()
}
```
Here is the main function of the content script. We get the rosterData for the current match_id (mixing camelCase and underscore_case... yikes!) and request the stats for each player. We create a map of username to HTML element to help keep track of where to insert the stats in the DOM.

```ts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if(request.type === 'getUserStatsNew')
    withSettings(getUserStatsFromPlayerId, "numMatches", "display")
      .then(f => f(request.player_id))
      .then(sendResponse)

  if(request.type === 'getMatchUsers')
    getMatchUsers(request.match_id).then(sendResponse)
  
  // wait for async response
  return true
});

const getMatchUsers = async (match_id:string) => {
  let matchRes = await fetchWrapper(`/data/v4/matches/${match_id}`);
  if(matchRes.status != 200){
      console.log('error finding stats')
      return
  }
  let matchData = await matchRes.json()
  return [...matchData.teams.faction1.roster, ...matchData.teams.faction2.roster]
}
```
Here is the main listener of the background script along with the getMatchUsers funcion. We can see it's pretty simple to get the users with the faceit api. 

In the listener, we can see a wrapper function around getUserStatsFromPlayerId. This is my attempt at creating a abstract way of supplying user settings to each function, in this case "numMatches" and "display" (really these should be constants). It is essentially a higher-order function that encapsulates the getting/setting of data from the chrome localStorage api. The function that computes the stats is too long and cumbersome, but essentially we use "numMatches" to determine the number of matches we use to compute the stats and "display" to determine which stats to show.

# Problem 4: Insert into the DOM
We have the stats for the current player now returned to us from the background script. Using the map we've made earlier, it's easy to determine where to insert them into the DOM. All that's left to do is make it look pretty.

# Problem 5: User settings
I wanted to give users more freedom to customize what stats are used. In the popup, a user can select how many matches they want to be considered. I decided to use the chrome localStorage api, since it is persisted as long as the extension is installed (which is good enough for this application). These settings are supplied to the background script functions using the withSettings() wrapper (dependency-injection style).

Here's a snippet of the popup:
```ts
<script setup lang="ts">
import { ref, watch } from 'vue'
import { debounce } from '../../helpers'

// state variables
const numMatches = ref(0)
const isLoading = ref(true)
const isError = ref(false)

// getting the current setting from background
chrome.storage.local.get(["numMatches"])
.then((result) => {
    numMatches.value = result["numMatches"]
    isLoading.value = false
    isError.value = false
}).catch((err)=>{
    console.log('error getting storage: '+err)
    isLoading.value = false
    isError.value = true
})

// debounce the updates
const debouncedUpdateMatches = debounce((newNumMatches:number)=>{
    chrome.storage.local.set({"numMatches":newNumMatches})
})

// watch for changes in setting
watch(numMatches, (numMatches, prevNumMatches) => {
    debouncedUpdateMatches(numMatches)
})
</script>
```

We can see that the default value is set to the current value of numMatches in local storage. We then watch for changes to the value of numMatches, and set it. We use debouncing since the UI component is a slider, and will have many intermediate values that we don't care about. This ensures only the last one actually runs the function, for performance purposes. 

# Conclusion
There are many details and corner cases, but this is a good overview of the happy path. One thing that struck me was the similarity between client/background scripts and client/server architecture. I'm glad I could practice good software design like encapsulation and dependency injection, along with solving some tricky problems.