/**
 * Zendesk Help Center Search Enhancement
 * Implements a search UX similar to Help Scout in Zendesk Guide
 * Pure vanilla JavaScript implementation - no jQuery required
 */
(function() {
    'use strict';
    
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
      
      // Find the search form in Zendesk structure
      let searchBar = null;
      
      // Try multiple selectors that might match the search form in different Zendesk themes
      const searchSelectors = [
        '#searchBar',
        '.search-form',
        'form[role="search"]',
        'form.search',
        '.header .search',
        'header .search',
        'form[action*="search"]',
        '.search' // Most generic, try last
      ];
      
      // Try each selector until we find a match
      for (let i = 0; i < searchSelectors.length; i++) {
        try {
          const el = document.querySelector(searchSelectors[i]);
          if (el) {
            searchBar = el;
            console.log(`Found search bar with selector: ${searchSelectors[i]}`);
            break;
          }
        } catch (e) {
          console.warn(`Error with selector ${searchSelectors[i]}:`, e);
        }
      }
      
      // If still not found, try to find the first form with a search input
      if (!searchBar) {
        const searchInputs = document.querySelectorAll('input[type="search"], input[name="query"]');
        if (searchInputs.length > 0) {
          for (let i = 0; i < searchInputs.length; i++) {
            const form = searchInputs[i].closest('form');
            if (form) {
              searchBar = form;
              console.log('Found search bar via input element');
              break;
            }
          }
        }
      }
      
      if (!searchBar) {
        console.error("Could not find search bar - no enhancement applied");
        return;
      }
      
      // Initialize the enhanced search
      new DocsWebSearch(searchBar);
    };
    
    // Main search class
    function DocsWebSearch(element) {
      console.log("Creating DocsWebSearch instance with element:", element);
      
      this.element = element;
      
      // Log all attributes of the form element for debugging
      console.log("Form attributes:");
      Array.from(element.attributes).forEach(attr => {
        console.log(` - ${attr.name}: ${attr.value}`);
      });
      
      // Find UI elements
      this.ui = {
        save: element.querySelector('button[type="submit"], input[type="submit"]'),
        input: element.querySelector('input[type="search"], input[type="text"], input[name="query"]'),
        resultContainer: element.querySelector("#serp-dd")
      };
      
      console.log("Found UI elements:", {
        save: !!this.ui.save,
        input: !!this.ui.input,
        resultContainer: !!this.ui.resultContainer
      });
      
      // Create result container if it doesn't exist
      if (!this.ui.resultContainer) {
        this.ui.resultContainer = document.createElement('div');
        this.ui.resultContainer.id = 'serp-dd';
        this.ui.resultContainer.className = 'search-results-dropdown';
        this.element.appendChild(this.ui.resultContainer);
        
        // Style the container
        Object.assign(this.ui.resultContainer.style, {
          'position': 'absolute',
          'top': '100%',
          'left': '0',
          'right': '0',
          'z-index': '1000',
          'background-color': '#fff',
          'border': '1px solid #ddd',
          'border-top': 'none',
          'border-radius': '0 0 4px 4px',
          'box-shadow': '0 5px 10px rgba(0,0,0,0.2)',
          'max-height': '400px',
          'overflow-y': 'auto',
          'display': 'none'
        });
      }
      
      // Create results list if it doesn't exist
      this.ui.resultsList = this.ui.resultContainer.querySelector("ul.result");
      if (!this.ui.resultsList) {
        this.ui.resultsList = document.createElement('ul');
        this.ui.resultsList.className = 'result';
        this.ui.resultContainer.appendChild(this.ui.resultsList);
        
        // Style the list
        Object.assign(this.ui.resultsList.style, {
          'margin': '0',
          'padding': '0',
          'list-style': 'none'
        });
      }
      
      // Ensure parent element has position relative for proper dropdown positioning
      const position = getComputedStyle(this.element).position;
      if (position === 'static') {
        this.element.style.position = 'relative';
      }
      
      // Set up event handlers
      this.setupEventHandlers();
      
      this.selectedIndex = -1;
      console.log("DocsWebSearch instance initialized");
    }
    
    DocsWebSearch.prototype = {
      setupEventHandlers: function() {
        // Save button events
        if (this.ui.save) {
          this.ui.save.addEventListener('mousedown', this.onSaveMouseDown.bind(this));
          this.ui.save.addEventListener('click', this.onSaveClick.bind(this));
        }
        
        // Input field events
        if (this.ui.input) {
          this.ui.input.addEventListener('keydown', this.onKeyDown.bind(this));
          this.ui.input.addEventListener('keyup', this.onKeyUp.bind(this));
          this.ui.input.addEventListener('focus', this.onFocus.bind(this));
          this.ui.input.addEventListener('blur', this.onBlur.bind(this));
        }
        
        // Result list events
        this.ui.resultContainer.addEventListener('click', this.onResultClick.bind(this));
      },
      
      onSaveMouseDown: function(e) {
        console.log("Save button mousedown");
        this.navigating = true;
      },
      
      onSaveClick: function(e) {
        console.log("Save button clicked");
        const query = this.ui.input.value;
        
        if (!query || query.length === 0) {
          console.log("Empty query, preventing form submission");
          e.preventDefault();
          e.stopPropagation();
          this.ui.input.classList.add("error");
          this.navigating = false;
        }
      },
      
      onResultClick: function(e) {
        // Find closest anchor element
        let target = e.target;
        while (target !== this.ui.resultContainer && target.tagName !== 'A') {
          target = target.parentElement;
          if (!target) return; // No anchor found
        }
        
        if (target.tagName === 'A') {
          console.log("Result item clicked");
          const href = target.getAttribute('href');
          
          if (href) {
            e.preventDefault();
            this.recordSearchAndNavigate(href);
          }
        }
      },
      
      // Handle input blur event
      onBlur: function(e) {
        console.log("Input blur event");
        
        if (this.delayCloseOnBlur) {
          console.log("Delay close on blur, setting timeout");
          this.closeTimeoutId = setTimeout(() => {
            this.closeSearchResults();
          }, 400);
        } else {
          console.log("Immediate close on blur");
          this.closeSearchResults();
        }
        
        this.delayCloseOnBlur = false;
      },
      
      // Handle input focus event
      onFocus: function(e) {
        console.log("Input focus event, value:", this.ui.input.value);
        
        if (this.ui.input.value) {
          console.log("Input has value, triggering search");
          this.doSearch();
        }
      },
      
      // Handle keydown events
      onKeyDown: function(e) {
        const keyCode = e.which || e.keyCode;
        console.log("Key down event, key code:", keyCode);
        
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
        
        // Clear any error state
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
        
        // Handle different keys
        if (keyCode === ENTER_KEY) {
          console.log("Enter key pressed");
          
          // If an item is selected, navigate to it
          if (this.selectedIndex != null && this.selectedIndex >= 0) {
            console.log("Item selected, index:", this.selectedIndex);
            const items = this.ui.resultsList.querySelectorAll("li");
            if (items.length > this.selectedIndex) {
              const link = items[this.selectedIndex].querySelector("a");
              if (link) {
                const href = link.getAttribute("href");
                if (href) {
                  this.recordSearchAndNavigate(href);
                }
              }
            }
          } 
          // Otherwise submit the form if there's a query
          else if (this.ui.input.value.length > 0) {
            console.log("No item selected but has value, submitting form");
            if (this.ui.save) {
              this.ui.save.click();
            } else {
              this.element.submit();
            }
          } 
          // Show error for empty query
          else if (!this.ui.input.value) {
            console.log("Empty input, adding error class");
            this.ui.input.classList.add("error");
          }
          
          this.stopSearchTimer();
        } 
        // Escape key - clear input and close results
        else if (keyCode === ESC_KEY) {
          console.log("Escape key pressed");
          this.ui.input.value = "";
          this.closeSearchResults();
        } 
        // Up arrow - navigate up in results
        else if (keyCode === UP_KEY && this.articles && this.articles.length) {
          console.log("Up arrow pressed");
          this.arrow("up");
        } 
        // Down arrow - navigate down in results
        else if (keyCode === DOWN_KEY && this.articles && this.articles.length) {
          console.log("Down arrow pressed");
          this.arrow("down");
        } 
        // Other keys - start search timer
        else if (keyCode !== LEFT_KEY && keyCode !== RIGHT_KEY && keyCode !== ESC_KEY) {
          console.log("Other key pressed, starting search timer");
          this.startSearchTimer();
        }
      },
      
      // Start timer for search to avoid too many requests
      startSearchTimer: function() {
        console.log("Starting search timer");
        clearTimeout(this.searchTimerId);
        this.searchTimerId = setTimeout(() => {
          this.checkSearch();
        }, 200);
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
        
        // Use the existing search form's endpoint if available, otherwise try known endpoints
        let endpoint;
        
        // Try to determine from form action
        const formAction = this.element.getAttribute('action');
        if (formAction) {
          console.log("Form action:", formAction);
          // If form action ends with .json, use it directly
          if (formAction.endsWith('.json')) {
            endpoint = formAction;
          } else {
            // Add .json to the endpoint if needed
            endpoint = formAction + (formAction.includes('?') ? '&' : '?') + 'format=json';
          }
        } else {
          // Fallback endpoint
          endpoint = "/api/v2/help_center/articles/search.json";
        }
        
        console.log("Using search endpoint:", endpoint);
        
        // Add query parameters
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.append('query', query);
        url.searchParams.append('per_page', '10');
        
        // Make fetch request to Zendesk search API
        fetch(url.toString(), {
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
          
          // Process Zendesk's response format - handle different possible structures
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
            console.log("No results found");
            this.noResults = this.ui.input.value === this.lastQueryValue;
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
        
        if (this.queryHasNotChanged(query)) {
          console.log("Query hasn't changed, skipping record");
          return Promise.resolve();
        }
        
        this.lastRecordedQueryValue = query;
        
        // Zendesk might have a different way to record search events - this is a placeholder
        console.log("Search recorded for:", query);
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
        
        // Clear previous results
        this.ui.resultsList.innerHTML = '';
        this.ui.resultContainer.style.display = 'none';
        
        if (this.articles && this.articles.length) {
          console.log("Articles found, count:", this.articles.length);
          
          for (let i = 0; i < this.articles.length; i++) {
            const article = this.articles[i];
            console.log("Processing article:", article.title || article.name || "Unnamed");
            
            const listItem = document.createElement('li');
            
            if (i === this.selectedIndex) {
              listItem.classList.add("active");
            }
            
            // Style the list item
            Object.assign(listItem.style, {
              'padding': '0',
              'margin': '0',
              'border-bottom': '1px solid #eee'
            });
            
            // Get the URL from the article depending on response format
            const articleUrl = article.html_url || article.url || "#";
            
            // Handle https protocol
            let finalUrl = articleUrl;
            if (window.location.protocol.indexOf("https") !== -1 && finalUrl) {
              finalUrl = finalUrl.replace("http://", "https://");
            }
            
            // Get the title from the article depending on response format
            const articleTitle = article.title || article.name || "Unnamed Article";
            
            const link = document.createElement('a');
            link.href = finalUrl;
            link.textContent = articleTitle;
            
            // Style the link
            Object.assign(link.style, {
              'display': 'block',
              'padding': '10px 15px',
              'color': '#333',
              'text-decoration': 'none'
            });
            
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
          const noResultsItem = document.createElement('li');
          noResultsItem.id = "noResults";
          noResultsItem.style.padding = "10px 15px";
          noResultsItem.style.color = "#999";
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
        this.ui.resultsList.innerHTML = '';
        this.ui.resultContainer.style.display = 'none';
        
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
        
        if (direction === "up") {
          this.selectedIndex = this.selectedIndex === -1 ? this.articles.length - 1 : this.selectedIndex - 1;
        } else if (direction === "down") {
          this.selectedIndex = this.selectedIndex === -1 ? 0 : this.selectedIndex + 1;
        }
        
        if (this.selectedIndex >= this.articles.length) {
          this.selectedIndex = -1;
        }
        
        console.log("New selected index:", this.selectedIndex);
        
        // Remove highlight from all items
        const items = this.ui.resultsList.querySelectorAll("li");
        items.forEach(item => {
          item.classList.remove("active");
          item.style.backgroundColor = '';
        });
        
        if (this.selectedIndex !== -1) {
          const item = items[this.selectedIndex];
          
          if (item) {
            console.log("Setting active item");
            item.classList.add("active");
            item.style.backgroundColor = '#f8f8f8';
            
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
        
        // Remove highlight from all items
        listItems.forEach(item => {
          item.classList.remove("active");
          item.style.backgroundColor = '';
        });
        
        // Highlight the hovered item
        target.classList.add("active");
        target.style.backgroundColor = '#f8f8f8';
      }
    };
    
    // Initialize when document is ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log("Document already ready, initializing docs web search");
      window.initDocsWebSearch();
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        console.log("Document ready event, initializing docs web search");
        window.initDocsWebSearch();
      });
    }
    
  })();