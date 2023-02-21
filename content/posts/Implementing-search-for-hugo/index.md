---
title: "Implementing Search for Hugo with Lunr"
date: 2023-02-19T14:04:58-05:00
tags: ["hugo", "project", "software"]
draft: true
---

Hugo's [search documentation](https://gohugo.io/tools/search/) is not very useful if you want to get simple search up and running quickly. What I've done is compiled instructions from a few sources, with extra explanation that may be useful for Hugo noobs like myself. 

<!--more-->

This article is adapted from [palant.info](https://palant.info/2020/06/04/the-easier-way-to-use-lunr-search-with-hugo/)'s article on adding search with [lunr.js](https://lunrjs.com/). Shout out to the author and his super customizable theme [memE](https://github.com/reuixiy/hugo-theme-meme) that includes search out of the box!

# Install
To 'install', we're going to simply include lunr.js with script tags. I created a new file at 'layouts/partials/script.html` to contain this and any future scripts I would need. Include this partial in your baseof.html layout.

layouts/partials/script.html
```HTML
<!-- lunr -->
<script defer src="https://cdn.jsdelivr.net/npm/lunr@2.3.8/lunr.min.js"></script>
<script defer src="{{ "js/lunr-search.js" | absURL }}"></script>
```
layouts/_default/baseof.html
```HTML
<!-- include script for lunr-search -->
{{ partial "script.html" . }}
```

We will be adding lunr-search.js to your static folder later.

# Search Index
The first thing Lunr requires is an index of your content. We will leverage Hugo to generate this for us. Just like how some of our content is HTML, we can tell Hugo that we also produce JSON. We can do this by adding a [custom output format](https://gohugo.io/templates/output-formats/) to our config, and then telling Hugo where it will be used. Add these lines to your config.toml:
```toml
[outputFormats]
  [outputFormats.SearchIndex]
    baseName = "search"
    mediaType = "application/json"

[outputs]
  home = ["HTML","SearchIndex"]
  page = ["HTML"]
```
Here we define the custom output format 'SearchIndex', which is used for all pages (home). Now, just like how we create HTML templates in 'layouts', we can create a JSON template too. We have to follow Hugo's naming convention for templates with custom output formats:
```
{kind}.{output_format}.{extension}
```
This is sort-of explained by Hugo's [lookup rules](https://gohugo.io/templates/lookup-order/), but not very well in my opinion.
Anyway, according to the docs the kind can be 'home' or 'index', our output format is 'searchindex' and the extension is '.json'. So we create the file:

layouts/index.searchindex.json
```json
[
    {{- range $index, $page := (where .Site.RegularPages "Type" "posts") -}}
        {{- if gt $index 0 -}} , {{- end -}}
        {{- $entry := dict "uri" $page.RelPermalink "title" $page.Title -}}
        {{- $entry = merge $entry (dict "content" ($page.Plain | htmlUnescape)) -}}
        {{- $entry = merge $entry (dict "summary" ($page.Summary | plainify | htmlUnescape)) -}}
        {{- $entry = merge $entry (dict "date" ($page.PublishDate | htmlUnescape)) -}}
        {{- $entry = merge $entry (dict "categories" $page.Params.categories) -}}
        {{- $entry | jsonify -}}
    {{- end -}}
]
```

We are looping over all the 'regular' pages (that is single content, and not lists of content to avoid duplicates), filtered to only posts. We then build a dictionary with the keys: uri, title, content, summary, date, and categories. You can customize this to contain anything you would like to search for by adding/removing entries. 
We can confirm the search index exists after the page rebuild by checking 'localhost:1313/search.json'.

# Searching and displaying results
Hugo already nicely sorts my posts by date and displays them on the 'posts' page for me. My plan is to include a search bar that pretends to filter this list by first hiding it and then dynamically injecting its search result list into the DOM. Then, if the search bar is reset, the search results will be removed and the original list unhidden. 

The search form and results are pretty simple. We have a search bar with an input and reset button. We have a hidden 'search-result' template, that will be cloned by the search function to display results. We also have a 'main-inner' div where the results are cloned under. Finally, I've added a hacky little script at the bottom to prevent the form from losing focus when the reset button is clicked. 

layouts/partials/search.html
```HTML
<form id="search" class="search" role="search">
    <label for="search-input">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon search-icon"><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/></svg>
    </label>
    <input placeholder="Search for post" type="search" id="search-input" class="search-input">
    <input class="clear" type="reset">
</form>

<template id="search-result" hidden>
  <div class="post">
      <p>
          <div class="date"></div>
          <h1><a class="summary-title-link"></a></h1>
          <summary class="summary"></summary>
      </p>
  </div>
</template>

<!-- results are inserted HERE -->
<div class="main-inner posts-list"></div>

<!-- prevent focus loss on clear -->
<script>
  document.querySelector(".clear").addEventListener("mousedown", e => e.preventDefault())
</script>
```

Here is the posts list page. 'default-list' is hidden by our search function and revealed on reset.

layouts/posts/list.html
```HTML
{{ define "main" }}
<h1>{{ .Page.Title }}</h1>
<br/>
{{ .Content }}

<!-- search functionality -->
{{ partial "search.html" }}

<div id="default-list" class="posts-list">
{{ range sort .Data.Pages "Date" "desc" }}
    {{ if not .Params.private }}
        <div class="post">
            <p>
                <div class="date">{{ .PublishDate.Format "Jan 2, 2006" }}</div>    
                <h1><a href="{{ .Permalink }}" title="{{ .Title }}">{{ .Title }}</a></h1>
                {{ .Summary }}
            </p>
        </div>
    {{ end }}
{{ end }}
</div>

{{ end }}
```

Some styling for the search bar, including an animation for the seach icon and changing the search bar length on focus. 

static/css/search.css
```css
@keyframes spin {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}

.search {
  display: flex;
  justify-content: center;
  height: 1.5em;
}

.search-icon {
  filter: invert(100%) sepia(0%) saturate(7500%) hue-rotate(30deg) brightness(113%) contrast(116%);
  cursor: pointer;
  width: 1.5em;
  height: 1.5em;
  margin-right: 0.5em;
}

.search[data-running] .search-icon {
  animation: spin 1.5s linear infinite;
}

.search-input {
  border-width: 0;
  padding: 0;
  margin: 0;
  width: 0;
  outline: none;
  background: transparent;
  transition: width 0.5s;
}

.search-input:focus {
  width: 10em;
}

.clear {
  margin-left: 0.5em;
  cursor: pointer;
}
```

# Search Function
Now onto the most important part, the search itself. We add a listener to the form which begins the search on submit and hides the existing posts list. We then perform the search with lunr, creating the index first if it does not exist. Inside 'search', we clone the hidden element, set the fields to what we found in the result, and append it to the target. We also add a listener for reset, which clears the results, and unhides the original list. This code will need to be modified for your use case, but thankfully it isn't too confusing.

static/js/lunr-search.js

```js
window.addEventListener("DOMContentLoaded", function(event)
{
  var index = null;
  var lookup = null;
  var queuedTerm = null;

  // important elements
  var form = document.getElementById("search");
  var input = document.getElementById("search-input");
  var posts = document.getElementById("default-list");

  // The element where search results should be displayed, adjust as needed.
  var target = document.querySelector(".main-inner");

  form.addEventListener("submit", function(event)
  {
    event.preventDefault();

    var term = input.value.trim();
    if (!term)
      return;

    startSearch(term);
  }, false);

  form.addEventListener("reset", function(event){
    // remove search results
    clear()
    // unhide posts
    posts.removeAttribute('hidden')
    // revert title
    document.title = 'sashco/posts/'; 
  })

  function startSearch(term)
  {
    // Start icon animation.
    form.setAttribute("data-running", "true");
    // Set date-ordered list to hidden
    posts.setAttribute("hidden", "true");

    if (index)
    {
      // Index already present, search directly.
      search(term);
    }
    else if (queuedTerm)
    {
      // Index is being loaded, replace the term we want to search for.
      queuedTerm = term;
    }
    else
    {
      // Start loading index, perform the search when done. (this is very overkill for this blog)
      queuedTerm = term;
      initIndex();
    }
  }

  function searchDone()
  {
    // Stop icon animation.
    form.removeAttribute("data-running");
    
    queuedTerm = null;
  }

  function initIndex()
  {
    var request = new XMLHttpRequest();
    request.open("GET", "/search.json");
    request.responseType = "json";
    request.addEventListener("load", function(event)
    {
      lookup = {};
      index = lunr(function()
      {
        this.ref("uri");

        // If you added more searchable fields to the search index, list them here.
        this.field("title");
        this.field("content");
        this.field("categories");
        this.field("summary");
        this.field("date");

        for (var doc of request.response)
        {
          this.add(doc);
          lookup[doc.uri] = doc;
        }
      });

      // Search index is ready, perform the search now
      search(queuedTerm);
    }, false);
    request.addEventListener("error", searchDone, false);
    request.send(null);
  }

  function search(term)
  {
    var results = index.search(term);

    // clear previous results
    clear()    

    var title = document.createElement("h1");
    title.id = "search-results";
    title.className = "list-title";

    if (results.length == 0)
      title.textContent = `No results found for “${term}”`;
    else if (results.length == 1)
      title.textContent = `Found one result for “${term}”`;
    else
      title.textContent = `Found ${results.length} results for “${term}”`;
    target.appendChild(title);
    document.title = title.textContent;

    var template = document.getElementById("search-result");
    for (var result of results)
    {
      var doc = lookup[result.ref];

      // Fill out search result template, adjust as needed.
      var element = template.content.cloneNode(true);
      element.querySelector(".summary-title-link").href = doc.uri;
      element.querySelector(".summary-title-link").textContent = doc.title;
      element.querySelector(".summary").textContent = doc.summary;
      // hacky conversion from golang date to js date
      let parts = doc.date.split(" ")
      let date = new Date(`${parts[0]}T${parts[1]}${parts[2]}`)
      var options = {year: 'numeric', month: 'short', day: 'numeric' };
      element.querySelector(".date").textContent = date.toLocaleDateString('en-us', options);
      // append the completed element
      target.appendChild(element);
    }
    title.scrollIntoView(true);

    searchDone();
  }

  // clear the search results
  function clear(){
    while (target.firstChild)
      target.removeChild(target.firstChild);
  }

}, false);
```

# Conclusion
And that's about it! I plan to expand this in the future by adding article tags that are included in the search index. But for now, I'm happy with this simple search. Feel free to check out my [github](https://github.com/sashco-m/sashcov2) to see how search is used for this site!