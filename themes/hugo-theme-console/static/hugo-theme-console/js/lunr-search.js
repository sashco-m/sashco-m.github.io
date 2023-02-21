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
    console.log('test')
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
        // Uncomment the following line and replace de by the right language
        // code to use a lunr language pack.

        // this.use(lunr.de);

        this.ref("uri");

        // If you added more searchable fields to the search index, list them here.
        this.field("title");
        this.field("content");
        this.field("summary");
        this.field("date");
        this.field("tags");

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
