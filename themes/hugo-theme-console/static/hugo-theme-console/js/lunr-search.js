window.addEventListener("DOMContentLoaded", function(event)
{
  var index = null;
  var lookup = null;
  var queuedTerm = null;

  // important elements
  var form = document.getElementById("search");
  var input = document.getElementById("search-input");
  var posts = document.getElementById("default-list");
  let tags = document.getElementById("default-tags")
  let title = document.getElementById('search-results-title')

  form.addEventListener("submit", function(event)
  {
    event.preventDefault();

    var term = input.value.trim();
    if (!term)
      return;

    startSearch(term);
  }, false);

  form.addEventListener("reset", function(event){
    // unhide posts
    Array.from(posts.children).forEach((post)=>{post.removeAttribute('hidden')})
    // unhide tags
    Array.from(tags.children).forEach((tag)=>{tag.classList.remove('hidden')})
    // revert title
    document.title = 'sashco/posts/'; 
    // hide result title
    title.classList.add('hidden')
  })

  function startSearch(term)
  {
    // Start icon animation.
    form.setAttribute("data-running", "true");

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

    if (results.length == 0)
      title.textContent = `No results found for “${term}”`;
    else if (results.length == 1)
      title.textContent = `Found one result for “${term}”`;
    else
      title.textContent = `Found ${results.length} results for “${term}”`;

    //unhide title 
    title.classList.remove('hidden');
    // set page title
    document.title = title.textContent;

    // POSSIBLE IMPROVEMENT: show match score beside article. that would be cool
    // also the 'results' array is ordered by match strength. we could sort the posts to match this
    // this might be hard though since we want to keep the original date ordering

    // ordered by match strength
    const refs = results.map((res)=>{return res.ref})
    // build the tags list when iterating over the posts
    let tagSet = new Set() 

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
    // have our tagset
    Array.from(tags.children).forEach((tag)=>{
      if(!tagSet.has(tag.textContent)){
        tag.classList.add('hidden')
      } else {
        tag.classList.remove('hidden')
      }
    })

    title.scrollIntoView(true);

    searchDone();
  }

}, false);
