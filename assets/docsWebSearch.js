/**
 * Superhuman-style docs search for Zendesk Help Center - Vanilla JS Version
 */
(function() {
    console.log("DocsWebSearch vanilla script loaded");
  
    // Key codes for keyboard navigation
    const ENTER_KEY = 13;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const ESC_KEY = 27;
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    
    // Initialize the search functionality
    window.initDocsWebSearch = function() {
      console.log("initDocsWebSearch called");
      
      // Try different possible search bar selectors used by Zendesk
      let searchBar = document.getElementById("searchBar");
      
      // If not found by ID, try common class names or form elements
      if (!searchBar) {
        searchBar = document.querySelector(".search");
        console.log("Searching by .search class:", searchBar ? "Found" : "Not found");
      }
      
      if (!searchBar) {
        searchBar = document.querySelector("form[role='search']");
        console.log("Searching by search role:", searchBar ? "Found" : "Not found");
      }
      
      if (!searchBar) {
        // Look for any search input field and use its parent form or container
        const searchInput = document.querySelector("input[type='search'], input[name='query']");
        if (searchInput) {
          console.log("Found search input:", searchInput);
          // Get the closest parent form or containing div
          searchBar = searchInput.closest("form") || searchInput.closest(".search-container") || searchInput.parentElement;
          console.log("Using parent element as search bar:", searchBar);
        }
      }
      
      console.log("Search bar found:", searchBar ? "Yes" : "No", searchBar);
      
      if (searchBar) {
        new DocsWebSearch(searchBar);
      } else {
        console.error("No search bar found with any common selectors. Create a custom search bar selector for your template.");
      }
    };
    
    // Main search class
    function DocsWebSearch(element) {
      console.log("Creating DocsWebSearch instance with element:", element);
      
      if (!element) {
        console.error("No search element found");
        return;
      }
      
      this.el = element;
      this.ui = {
        save: element.querySelector('button[type="submit"]'),
        input: element.querySelector('input[name="query"]'),
        resultContainer: element.querySelector("#serp-dd"),
        resultsList: element.querySelector("ul.result")
      };
      
      console.log("UI elements found:", {
        save: this.ui.save ? "Yes" : "No",
        input: this.ui.input ? "Yes" : "No",
        resultContainer: this.ui.resultContainer ? "Yes" : "No",
        resultsList: this.ui.resultsList ? "Yes" : "No"
      });
      
      // Create result container if it doesn't exist
      if (!this.ui.resultContainer) {
        console.log("Creating result container as it doesn't exist");
        this.ui.resultContainer = document.createElement('div');
        this.ui.resultContainer.id = "serp-dd";
        this.ui.resultContainer.className = "sb";
        this.ui.resultContainer.style.display = "none";
        
        // Position the results directly under the search bar
        this.ui.resultContainer.style.position = "absolute";
        this.ui.resultContainer.style.zIndex = "1000";
        this.ui.resultContainer.style.width = "100%";
        this.ui.resultContainer.style.top = "100%"; // Position it right below the search bar
        this.ui.resultContainer.style.left = "0";
        this.ui.resultContainer.style.backgroundColor = "#fff";
        this.ui.resultContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
        this.ui.resultContainer.style.borderRadius = "0 0 4px 4px";
        
        // Make sure the parent element has position relative for proper absolute positioning
        if (getComputedStyle(this.el).position === "static") {
          this.el.style.position = "relative";
        }
        
        this.el.appendChild(this.ui.resultContainer);
      }
      
      // Create results list if it doesn't exist
      if (!this.ui.resultsList) {
        console.log("Creating results list as it doesn't exist");
        this.ui.resultsList = document.createElement('ul');
        this.ui.resultsList.className = "result";
        this.ui.resultContainer.appendChild(this.ui.resultsList);
      }
      
      // Set up event handlers
      console.log("Setting up event handlers");
      
      if (this.ui.save) {
        this.ui.save.addEventListener("mousedown", () => {
          console.log("Save button mousedown");
          this.navigating = true;
        });
        
        this.ui.save.addEventListener("click", (e) => {
          console.log("Save button clicked");
          const query = this.ui.input.value;
          console.log("Query on click:", query);
          
          if (!query || query.length === 0) {
            console.log("Empty query, preventing default");
            e.preventDefault();
            e.stopPropagation();
            this.ui.input.classList.add("error");
            this.navigating = false;
          }
        });
      }
      
      if (this.ui.input) {
        this.ui.input.addEventListener("keydown", this.onKeyDown.bind(this));
        this.ui.input.addEventListener("keyup", this.onKeyUp.bind(this));
        this.ui.input.addEventListener("focus", this.onFocus.bind(this));
        this.ui.input.addEventListener("blur", this.onBlur.bind(this));
      }
      
      if (this.ui.resultsList) {
        this.ui.resultsList.addEventListener("click", (e) => {
          // Check if the click was on an anchor element or its child
          let target = e.target;
          while (target !== e.currentTarget && target.tagName !== 'A') {
            target = target.parentElement;
          }
          
          if (target.tagName === 'A') {
            console.log("Result item clicked");
            const href = target.getAttribute("href");
            console.log("Result href:", href);
            
            if (href) {
              e.preventDefault();
              this.recordSearchAndNavigate(href);
            }
          }
        });
      }
      
      this.selectedIndex = -1;
      console.log("DocsWebSearch instance initialized");
    }
    
    DocsWebSearch.prototype = {
      // Handle input field blur
      onBlur: function(e) {
        console.log("Input blur event");
        
        if (this.delayCloseOnBlur) {
          console.log("Delay close on blur, setting timeout");
          this.closeTimeoutId = setTimeout(this.closeSearchResults.bind(this), 400);
        } else {
          console.log("Immediate close on blur");
          this.closeSearchResults();
        }
        this.delayCloseOnBlur = false;
      },
      
      // Handle input field focus
      onFocus: function(e) {
        console.log("Input focus event, value:", this.ui.input.value);
        
        if (this.ui.input.value) {
          console.log("Input has value, triggering search");
          this.doSearch();
        }
      },
      
      // Handle keydown events
      onKeyDown: function(e) {
        console.log("Key down event, key code:", e.which || e.keyCode);
        
        const keyCode = e.which || e.keyCode;
        // Prevent default behavior for enter, up, and down keys
        if (keyCode === ENTER_KEY || keyCode === UP_KEY || keyCode === DOWN_KEY) {
          console.log("Preventing default for navigation key");
          e.preventDefault();
        }
      },
      
      // Handle keyup events
      onKeyUp: function(e) {
        const keyCode = e.which || e.keyCode;
        console.log("Key up event, key code:", keyCode);
        
        this.noResults = false;
        const noResultsEl = this.ui.resultsList.querySelector("#noResults");
        if (noResultsEl) {
          noResultsEl.remove();
        }
        this.ui.input.classList.remove("error");
        
        // Hide results container if there are no results
        if (this.ui.resultsList.querySelectorAll("li").length === 0) {
          console.log("No results, hiding container");
          this.ui.resultContainer.style.display = "none";
        }
        
        // Handle different key presses
        if (keyCode === ENTER_KEY) {
          console.log("Enter key pressed");
          // Enter key pressed - navigate or submit form
          if (this.selectedIndex != null && this.selectedIndex >= 0) {
            console.log("Item selected, index:", this.selectedIndex);
            const selectedLi = this.ui.resultsList.querySelectorAll("li")[this.selectedIndex];
            if (selectedLi) {
              const href = selectedLi.querySelector("a").getAttribute("href");
              console.log("Selected item href:", href);
              
              if (href) {
                this.recordSearchAndNavigate(href);
              }
            }
          } else if (this.ui.input.value.length > 0) {
            console.log("No item selected but has value, clicking save button");
            if (this.ui.save) {
              // Simulate a click on the save button
              const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
              });
              this.ui.save.dispatchEvent(event);
            }
          } else if (!this.ui.input.value) {
            console.log("Empty input, adding error class");
            this.ui.input.classList.add("error");
          }
          this.stopSearchTimer();
        } else if (keyCode === ESC_KEY) {
          console.log("Escape key pressed");
          // Escape key pressed - clear input and close results
          this.ui.input.value = "";
          this.closeSearchResults();
        } else if (keyCode === UP_KEY && this.articles && this.articles.length) {
          console.log("Up arrow pressed");
          // Up arrow pressed - navigate up in results
          this.arrow("up");
        } else if (keyCode === DOWN_KEY && this.articles && this.articles.length) {
          console.log("Down arrow pressed");
          // Down arrow pressed - navigate down in results
          this.arrow("down");
        } else if (keyCode !== LEFT_KEY && keyCode !== RIGHT_KEY && keyCode !== ESC_KEY) {
          console.log("Other key pressed, starting search timer");
          // Any other key pressed - start search timer
          this.startSearchTimer();
        }
      },
      
      // Start timer for search to avoid too many requests
      startSearchTimer: function() {
        console.log("Starting search timer");
        clearTimeout(this.searchTimerId);
        this.searchTimerId = setTimeout(this.checkSearch.bind(this), 200);
      },
      
      // Stop search timer
      stopSearchTimer: function() {
        console.log("Stopping search timer");
        clearTimeout(this.searchTimerId);
      },
      
      // Check if search should be performed
      checkSearch: function() {
        console.log("Checking search");
        const query = this.ui.input.value;
        console.log("Current query:", query);
        
        if (query && query.length) {
          console.log("Query has value, performing search");
          this.doSearch();
        } else {
          console.log("Empty query, closing results");
          this.closeSearchResults();
          this.lastQueryValue = query;
        }
      },
      
      // Perform search
      doSearch: function() {
        console.log("Performing search");
        const query = this.ui.input.value;
        console.log("Search query:", query);
        
        this.lastQueryValue = query;
        
        // Abort previous request if still in progress
        if (this.queryXhr && this.queryXhr.abort) {
          console.log("Aborting previous request");
          this.queryXhr.abort();
        }
        
        this.searching = true;
        console.log("Making fetch request to Zendesk search API");
        
        // Try different endpoints that might work with Zendesk
        const endpoint = "/hc/en-us/search/autocomplete.json"; // Changed from /api/v2/help_center/articles/search.json
        console.log("Using endpoint:", endpoint);
        
        // Make fetch request to Zendesk search API
        this.queryXhr = fetch(`${endpoint}?query=${encodeURIComponent(query)}&per_page=10`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(response => {
          console.log("Search request successful, response:", response);
          
          // Process different response formats
          if (response && response.results && response.results.length > 0) {
            console.log("Found results in response.results");
            this.noResults = false;
            this.articles = response.results;
            this.count = response.count || response.results.length;
          } else if (response && response.articles && response.articles.length > 0) {
            console.log("Found results in response.articles");
            this.noResults = false;
            this.articles = response.articles;
            this.count = response.count || response.articles.length;
          } else if (response && Array.isArray(response) && response.length > 0) {
            console.log("Found results in array response");
            this.noResults = false;
            this.articles = response;
            this.count = response.length;
          } else {
            console.log("No results found in response");
            this.noResults = this.ui.input.value == this.lastQueryValue;
            this.count = 0;
            this.articles = [];
          }
          
          this.searching = false;
          this.selectedIndex = -1;
          this.refresh();
        })
        .catch(error => {
          console.error("Search request failed:", error);
          
          this.noResults = true;
          this.count = 0;
          this.articles = [];
          this.searching = false;
          this.selectedIndex = -1;
          this.refresh();
        });
      },
      
      // Record search for analytics
      recordSearch: function() {
        console.log("Recording search");
        const query = this.ui.input.value;
        console.log("Query to record:", query);
        
        if (this.queryHasNotChanged(query)) {
          console.log("Query hasn't changed, skipping record");
          return Promise.resolve();
        }
        
        this.lastRecordedQueryValue = query;
        console.log("Query recorded");
        
        // Return resolved promise since we're not actually recording
        return Promise.resolve();
      },
      
      // Record search and navigate to result
      recordSearchAndNavigate: function(url) {
        console.log("Recording search and navigating to:", url);
        this.navigating = true;
        this.recordSearch().then(() => {
          console.log("Navigation in progress to:", url);
          window.location = url;
        });
      },
      
      // Check if query has changed
      queryHasNotChanged: function(query) {
        const result = !query || query === this.lastRecordedQueryValue;
        console.log("Query hasn't changed:", result);
        return result;
      },
      
      // Refresh search results
      refresh: function() {
        console.log("Refreshing search results");
        while (this.ui.resultsList.firstChild) {
          this.ui.resultsList.removeChild(this.ui.resultsList.firstChild);
        }
        this.ui.resultContainer.style.display = "none";
        
        // Add an event listener to close results when clicking outside
        // We add this here to avoid adding multiple listeners
        if (!this._hasDocumentClickListener) {
          document.addEventListener('click', (e) => {
            // Only close if the click is outside the search bar and results
            if (!this.el.contains(e.target)) {
              this.closeSearchResults();
            }
          });
          this._hasDocumentClickListener = true;
        }
        
        if (this.articles && this.articles.length) {
          console.log("Articles found, count:", this.articles.length);
          
          for (let i = 0; i < this.articles.length; i++) {
            const article = this.articles[i];
            console.log("Processing article:", article.title || article.name || "Unnamed");
            
            const listItem = document.createElement("li");
            
            if (i == this.selectedIndex) {
              listItem.classList.add("active");
              listItem.style.backgroundColor = "#f0f0f0";
            }
            
            // Add hover effects with inline styles
            listItem.style.cursor = "pointer";
            listItem.style.transition = "background-color 0.2s";
            
            // Get the URL from the article depending on response format
            const articleUrl = article.html_url || article.url || "#";
            console.log("Article URL:", articleUrl);
            
            // Handle https protocol
            let finalUrl = articleUrl;
            if (window.location.protocol.indexOf("https") != -1 && finalUrl) {
              finalUrl = finalUrl.replace("http://", "https://");
            }
            
            // Get the title from the article depending on response format
            const articleTitle = article.title || article.name || "Unnamed Article";
            
            const link = document.createElement("a");
            link.href = finalUrl;
            link.textContent = articleTitle;
            
            // Style the link for better appearance
            link.style.display = "block";
            link.style.padding = "10px 15px";
            link.style.textDecoration = "none";
            link.style.color = "#333";
            
            link.addEventListener("mousedown", () => {
              console.log("Link mousedown");
              this.delayCloseOnBlur = true;
            });
            
            link.addEventListener("mouseup", () => {
              console.log("Link mouseup");
              clearTimeout(this.closeTimeoutId);
            });
            
            listItem.appendChild(link);
            listItem.addEventListener("mouseover", this.hover.bind(this));
            
            this.ui.resultsList.appendChild(listItem);
          }
          
          console.log("Showing results list and container");
          this.ui.resultsList.style.display = "block";
          this.ui.resultContainer.style.display = "block";
        } else if (this.noResults) {
          console.log("No results, showing message");
          const noResultsItem = document.createElement("li");
          noResultsItem.className = "noResults";
          noResultsItem.textContent = "No results found";
          this.ui.resultsList.appendChild(noResultsItem);
          this.ui.resultContainer.style.display = "block";
        } else {
          console.log("No results and not in 'no results' state");
        }
      },
      
      // Close search results
      closeSearchResults: function() {
        console.log("Closing search results");
        while (this.ui.resultsList.firstChild) {
          this.ui.resultsList.removeChild(this.ui.resultsList.firstChild);
        }
        this.ui.resultContainer.style.display = "none";
        
        if (!this.navigating) {
          console.log("Not navigating, recording search");
          this.recordSearch();
        } else {
          console.log("Navigating, not recording search");
        }
      },
      
      // Handle arrow key navigation
      arrow: function(direction) {
        console.log("Arrow navigation:", direction);
        
        if (direction == "up") {
          this.selectedIndex = this.selectedIndex == -1 ? this.articles.length - 1 : this.selectedIndex - 1;
        } else if (direction == "down") {
          this.selectedIndex = this.selectedIndex == -1 ? 0 : this.selectedIndex + 1;
        }
        
        if (this.selectedIndex >= this.articles.length) {
          this.selectedIndex = -1;
        }
        
        console.log("New selected index:", this.selectedIndex);
        
        const listItems = this.ui.resultsList.querySelectorAll("li");
        listItems.forEach(item => item.classList.remove("active"));
        
        if (this.selectedIndex != -1) {
          const item = listItems[this.selectedIndex];
          if (item) {
            console.log("Setting active item");
            item.classList.add("active");
            
            // Handle scrolling if necessary
            const itemTop = item.offsetTop;
            const scrollTop = this.ui.resultsList.scrollTop;
            const containerHeight = this.ui.resultsList.clientHeight;
            const itemHeight = item.clientHeight;
            
            console.log("Scroll metrics:", {
              itemTop,
              scrollTop,
              containerHeight,
              itemHeight
            });
            
            const bottomPos = scrollTop + containerHeight - itemHeight;
            const innerHeight = this.ui.resultsList.scrollHeight;
            const minScrollTop = innerHeight < bottomPos ? innerHeight - containerHeight : scrollTop;
            
            if (itemTop < minScrollTop || itemTop > bottomPos) {
              console.log("Scrolling to item");
              this.ui.resultsList.scrollTop = itemTop;
            }
          }
        }
      },
      
      // Handle hover over search results
      hover: function(e) {
        console.log("Hover event");
        let target = e.target;
        if (target.tagName !== "LI") {
          console.log("Target is not li, finding closest li");
          while (target && target.tagName !== "LI") {
            target = target.parentNode;
          }
        }
        
        if (!target || target.tagName !== "LI") return;
        
        const listItems = Array.from(this.ui.resultsList.querySelectorAll("li"));
        this.selectedIndex = listItems.indexOf(target);
        console.log("Hover selected index:", this.selectedIndex);
        
        listItems.forEach(item => item.classList.remove("active"));
        target.classList.add("active");
      }
    };
    
    // Initialize search when document is ready
    if (document.readyState === "complete" || document.readyState === "interactive") {
      console.log("Document already ready, initializing docs web search");
      initDocsWebSearch();
    } else {
      document.addEventListener("DOMContentLoaded", function() {
        console.log("Document ready event, initializing docs web search");
        initDocsWebSearch();
      });
    }
    
  })();
  
  // export the function for use in other modules
  export default initDocsWebSearch;