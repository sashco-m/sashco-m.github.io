---
title: "Simplifying Hugo Search (and adding Tags)"
date: 2023-02-26T14:25:46-05:00
tags: ["hugo", "project", "software"]
---

This article picks up directly from [Implementing Search For Hugo with Lunr](/posts/implementing-search-for-hugo). That article was about getting search up and running quickly. This one will be about simplifying the implementation and adding a new feature altogether: article tags! 

<!--more-->

# DRY Problem 
What I had before was a list of all articles generated in my Hugo template, nicely ordered by date. When a search was performed, that list was hidden, and the results were inserted dynamically. This duplicated code: I had to make sure the inserted html matched what was generated by Hugo. This was made even clearer when adding tag support.

# Solution
To simplify this, the search will instead iterate over the generated posts list and hide irrelevant articles. Now, I can remove any element cloning and insertion into the DOM, as well as the hidden template elements I cloned from.
The new lunr-search.js code looks like this:

/static/js/lunr-search.js
```js
const refs = results.map((res)=>{return res.ref})

Array.from(posts.children).forEach((post)=>{
    // exact path for finding the ref. ugly. needs to change when html structure changes
    if(!refs.includes(post.children[2].children[0].pathname)){
    // hide unmatched
    post.setAttribute('hidden','true')
    } else {
    // show matched (in case some are hidden from previous search)
    post.removeAttribute('hidden')
    // add tags
    Array.from(post.children[5].children).forEach((tag)=>{
        tagSet.add(tag.textContent.trim())
    })
    }
})
```

The 'results' array contains paths to our articles (ex. '/posts/example-article'). We create a 'refs' array to easily check what paths we want to include in our result. From here on, we check if the link in our article matches the path in the 'refs' array to determine whether to show/hide the post.
We can also see that if the post is supposed to be shown, its tags are added to 'tagSet'. This allows us to only display the tags of visible articles.

# Tag Sidebar
Directly below the code to hide/show articles, we have the code to hide/show tags. It works very similarly to above:

/static/js/lunr-search.js
```js
Array.from(tags.children).forEach((tag)=>{
    if(!tagSet.has(tag.textContent)){
        tag.classList.add('hidden')
    } else {
        tag.classList.remove('hidden')
    }
})
```

Except setting the 'hidden' attribute does not work for me here. I apply a class that sets 'display' to 'none'.
The Hugo template generating the original sidebar is not too bad either. Simply keep setting 'taglist' as the unique elements between itself and the current page's tags. Then, render a link for each tag in the taglist.

layouts/posts/list.html
```html
<div id="main-tags" class="tag-sidebar">
    <h2>Tags:</h2>
    <div id="default-tags">
        <!-- loop through all pages, find unique tags -->
        {{ $taglist := slice }} 
        {{ range .Data.Pages }}
            {{ $taglist = uniq ($taglist | append .Params.tags) }}
        {{ end }}
        {{ range $taglist }}
        <a class="tag" onClick="searchByTag()">{{ . }}</a>
        {{ end }}
    </div>
</div>
```

However, we want to be able to filter articles by tags. We do this by adding the 'searchByTag()' function. It simply sets the value in the 'search-input' to its textContent. Then, it triggers a new 'submit' event, which we listen for in 'lunr-search.js'. So, it just performs a search on that tag. Nice and simple! 

layouts/posts/list.html
```html
<!-- integrate tags with search -->
<script>
    let form = document.getElementById("search");
    let input = document.getElementById("search-input");

    searchByTag = () => {
        // set the searchbar to the tag
        input.value = event.target.textContent.trim()
        // create submit event (initiate search)
        let submitEvent = new Event('submit', {
            'bubbles'    : true, // Whether the event will bubble up through the DOM or not
            'cancelable' : true  // Whether the event may be canceled or not
        })
        form.dispatchEvent(submitEvent)
    }
</script>
```

This function is also used by the tags displayed below each article. The full html template of a single post in the post list looks like this:

layouts/posts/list.html
```html
<div id="default-list" class="posts-list">
    {{ range sort .Data.Pages "Date" "desc" }}
        {{ if not .Params.private }}
            <div class="post">
                <p>
                    <div class="date">{{ .PublishDate.Format "Jan 2, 2006" }}</div>    
                    <h1><a class="post-ref" href="{{ .Permalink }}" title="{{ .Title }}">{{ .Title }}</a></h1>
                    {{ .Summary }}
                </p>
                <div class="tags">
                    {{ range .Params.tags }}
                        <a class="tag" onClick="searchByTag()"> {{ . }} </a>
                {{ end }}
                </div>
            </div>
        {{ end }}
    {{ end }}
</div>

```

All the changes made for this feature can be found on this [commit](https://github.com/sashco-m/sashcov2/commit/50117346c94ccb815ad0893cf26f22fe3059ccc2). At this point I'm quite happy with how search functions on the blog. One little improvement I'd like to add is showing the 'match' percentage that lunr gives you for each result. The only problem is that since the articles are ordered by date, the highest match isn't always shown first. I'll have to think about it!