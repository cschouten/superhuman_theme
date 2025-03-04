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
      
      // Log all forms on the page to help with debugging
      const allForms = document.querySelectorAll('form');
      console.log("All forms on page:", allForms.length);
      allForms.forEach((form, i) => {
        console.log(`Form ${i}:`, form);
        console.log(`Form ${i} HTML:`, form.outerHTML);
      });
      
      // Log all search inputs on the page
      const allSearchInputs = document.querySelectorAll('input[type="search"], input[name="query"]');
      console.log("All search inputs:", allSearchInputs.length);
      allSearchInputs.forEach((input, i) => {
        console.log(`Search input ${i}:`, input);
        console.log(`Search input ${i} parent:`, input.parentElement);
      });
      
      // Try to find the search container
      // First try the form containing the search input
      let searchContainer = null;
      const searchInput = document.querySelector('input[type="search"], input[name="query"]');
      
      if (searchInput) {
        console.log("Found search input:", searchInput);
        // Try to get the main search container
        searchContainer = searchInput.closest('form');
        console.log("Search form:", searchContainer);
        
        // If we found a container, initialize the search
        if (searchContainer) {
          console.log("Initializing DocsWebSearch with container:", searchContainer);
          new DocsWebSearch(searchContainer, searchInput);
        } else {
          console.error("Found search input but couldn't identify container");
        }
      } else {
        console.error("No search input found on page");
      }
    };
    
    // Main search class
    function DocsWebSearch(container, inputElement) {
      console.log("Creating DocsWebSearch instance");
      
      this.container = container;
      this.searchInput = inputElement;
      
      // Get button if it exists
      this.searchButton = container.querySelector('button[type="submit"], input[type="submit"]');
      console.log("Search button:", this.searchButton);
      
      // Create results container that will appear under the search
      this.createResultsContainer();
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Log search form structure to debug
      this.logSearchFormStructure();
      
      console.log("DocsWebSearch instance initialized");
    }
    
    DocsWebSearch.prototype = {
      createResultsContainer: function() {
        console.log("Creating results container");
        
        // Create results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.id = "search-results-dropdown";
        this.resultsContainer.style.display = "none";
        this.resultsContainer.style.position = "absolute";
        this.resultsContainer.style.zIndex = "1000";
        this.resultsContainer.style.width = "100%";
        this.resultsContainer.style.backgroundColor = "#fff";
        this.resultsContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
        this.resultsContainer.style.borderRadius = "0 0 4px 4px";
        this.resultsContainer.style.marginTop = "0";
        this.resultsContainer.style.top = "100%"; // Position below the search
        this.resultsContainer.style.left = "0";
        
        // Create results list
        this.resultsList = document.createElement('ul');
        this.resultsList.style.listStyle = "none";
        this.resultsList.style.padding = "0";
        this.resultsList.style.margin = "0";
        this.resultsList.style.maxHeight = "300px";
        this.resultsList.style.overflowY = "auto";
        
        // Add results list to container
        this.resultsContainer.appendChild(this.resultsList);
        
        // Ensure parent container has position relative
        const containerPosition = getComputedStyle(this.container).position;
        console.log("Container position style:", containerPosition);
        if (containerPosition === "static") {
          console.log("Setting container to position relative");
          this.container.style.position = "relative";
        }
        
        // Log the container dimensions for debugging
        console.log("Container dimensions:", {
          width: this.container.offsetWidth,
          height: this.container.offsetHeight,
          top: this.container.offsetTop,
          left: this.container.offsetLeft
        });
        
        // Try to find a better place to append the results container
        // First, try to find a specific container for the search input
        const searchInputParent = this.searchInput.parentElement;
        
        console.log("Search input parent:", searchInputParent);
        
        // Append to search container or to the body as a fallback
        if (searchInputParent && searchInputParent !== this.container) {
          console.log("Appending results to search input parent");
          
          // If the parent is not positioned, set it to relative
          if (getComputedStyle(searchInputParent).position === "static") {
            searchInputParent.style.position = "relative";
          }
          
          searchInputParent.appendChild(this.resultsContainer);
        } else {
          console.log("Appending results to search container");
          this.container.appendChild(this.resultsContainer);
        }
        
        console.log("Results container created and appended:", this.resultsContainer);
      },
      
      setupEventHandlers: function() {
        console.log("Setting up event handlers");
        
        // Handle input focus
        this.searchInput.addEventListener('focus', this.onFocus.bind(this));
        
        // Handle input blur
        this.searchInput.addEventListener('blur', this.onBlur.bind(this));
        
        // Handle keyup/keydown
        this.searchInput.addEventListener('keydown', this.onKeyDown.bind(this));
        this.searchInput.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Handle search button clicks
        if (this.searchButton) {
          this.searchButton.addEventListener('click', this.onSearchButtonClick.bind(this));
        }
        
        // Handle clicks outside search area
        document.addEventListener('click', (e) => {
          if (!this.container.contains(e.target)) {
            this.closeSearchResults();
          }
        });
        
        console.log("Event handlers set up");
      },
      
      onFocus: function(e) {
        console.log("Search input focused");
        if (this.searchInput.value) {
          console.log("Search input has value, triggering search");
          this.startSearchTimer();
        }
      },
      
      onBlur: function(e) {
        console.log("Search input blurred");
        
        // Don't close results if clicking a result
        if (this.delayCloseOnBlur) {
          console.log("Delaying close on blur");
          this.closeTimeoutId = setTimeout(() => {
            this.closeSearchResults();
          }, 200);
        }
        this.delayCloseOnBlur = false;
      },
      
      onKeyDown: function(e) {
        const keyCode = e.which || e.keyCode;
        console.log("Key down, code:", keyCode);
        
        if (keyCode === UP_KEY || keyCode === DOWN_KEY) {
          // Prevent default scrolling behavior for arrows
          e.preventDefault();
        }
      },
      
      onKeyUp: function(e) {
        const keyCode = e.which || e.keyCode;
        console.log("Key up, code:", keyCode);
        
        if (keyCode === ENTER_KEY) {
          // Handle enter key - navigate to selected result
          if (this.selectedIndex >= 0 && this.results && this.results.length > this.selectedIndex) {
            const selectedResult = this.results[this.selectedIndex];
            const url = selectedResult.html_url || selectedResult.url;
            
            if (url) {
              console.log("Navigating to:", url);
              window.location.href = url;
            }
          }
        } else if (keyCode === ESC_KEY) {
          // Close results
          this.closeSearchResults();
        } else if (keyCode === UP_KEY && this.results && this.results.length) {
          // Navigate up in results
          this.navigateResults('up');
        } else if (keyCode === DOWN_KEY && this.results && this.results.length) {
          // Navigate down in results
          this.navigateResults('down');
        } else if (keyCode !== LEFT_KEY && keyCode !== RIGHT_KEY) {
          // Start search timer for other keys
          this.startSearchTimer();
        }
      },
      
      onSearchButtonClick: function(e) {
        console.log("Search button clicked");
        
        // If there are no search terms, prevent submission
        if (!this.searchInput.value.trim()) {
          e.preventDefault();
          console.log("Empty search, preventing submit");
          this.searchInput.focus();
        }
      },
      
      startSearchTimer: function() {
        console.log("Starting search timer");
        clearTimeout(this.searchTimerId);
        this.searchTimerId = setTimeout(() => {
          this.checkSearch();
        }, 200);
      },
      
      checkSearch: function() {
        console.log("Checking search");
        const query = this.searchInput.value.trim();
        
        if (query) {
          console.log("Search query:", query);
          this.performSearch(query);
        } else {
          console.log("Empty query, closing results");
          this.closeSearchResults();
        }
      },
      
      performSearch: function(query) {
        console.log("Performing search for:", query);
        
        // Abort previous request if any
        if (this.currentRequest && this.currentRequest.abort) {
          this.currentRequest.abort();
        }
        
        const endpoint = "/hc/en-us/search/autocomplete.json";
        const url = `${endpoint}?query=${encodeURIComponent(query)}&per_page=8`;
        
        console.log("Fetching from:", url);
        this.currentRequest = fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log("Search results:", data);
            
            // Process results
            if (data && data.results && data.results.length > 0) {
              this.results = data.results;
              this.selectedIndex = -1;
              this.displayResults();
            } else if (data && data.articles && data.articles.length > 0) {
              this.results = data.articles;
              this.selectedIndex = -1;
              this.displayResults();
            } else {
              console.log("No results found");
              this.displayNoResults();
            }
          })
          .catch(error => {
            console.error("Search error:", error);
            this.displayNoResults();
          });
      },
      
      displayResults: function() {
        console.log("Displaying results");
        
        // Clear previous results
        while (this.resultsList.firstChild) {
          this.resultsList.removeChild(this.resultsList.firstChild);
        }
        
        // Add each result
        this.results.forEach((result, index) => {
          const item = document.createElement('li');
          item.style.padding = "0";
          item.style.margin = "0";
          item.style.transition = "background-color 0.2s";
          
          const link = document.createElement('a');
          link.href = result.html_url || result.url;
          link.textContent = result.title || result.name;
          link.style.display = "block";
          link.style.padding = "10px 15px";
          link.style.textDecoration = "none";
          link.style.color = "#333";
          
          // Prevent default navigation and handle manually
          link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = link.href;
          });
          
          link.addEventListener('mousedown', () => {
            this.delayCloseOnBlur = true;
          });
          
          // Add hover handler
          item.addEventListener('mouseover', () => {
            this.selectedIndex = index;
            this.highlightSelectedResult();
          });
          
          item.appendChild(link);
          this.resultsList.appendChild(item);
        });
        
        // Show results container
        this.resultsContainer.style.display = "block";
        
        console.log("Results displayed");
      },
      
      displayNoResults: function() {
        console.log("Displaying no results message");
        
        // Clear previous results
        while (this.resultsList.firstChild) {
          this.resultsList.removeChild(this.resultsList.firstChild);
        }
        
        // Add no results message
        const item = document.createElement('li');
        item.style.padding = "10px 15px";
        item.style.color = "#666";
        item.textContent = "No results found";
        
        this.resultsList.appendChild(item);
        this.resultsContainer.style.display = "block";
        
        this.results = [];
        this.selectedIndex = -1;
      },
      
      navigateResults: function(direction) {
        console.log("Navigating results:", direction);
        
        if (!this.results || this.results.length === 0) {
          return;
        }
        
        if (direction === 'up') {
          this.selectedIndex = this.selectedIndex <= 0 ? this.results.length - 1 : this.selectedIndex - 1;
        } else {
          this.selectedIndex = this.selectedIndex >= this.results.length - 1 ? 0 : this.selectedIndex + 1;
        }
        
        this.highlightSelectedResult();
      },
      
      highlightSelectedResult: function() {
        console.log("Highlighting selected result:", this.selectedIndex);
        
        // Remove highlight from all items
        const items = this.resultsList.querySelectorAll('li');
        items.forEach(item => {
          item.style.backgroundColor = "";
        });
        
        // Add highlight to selected item
        if (this.selectedIndex >= 0 && items.length > this.selectedIndex) {
          items[this.selectedIndex].style.backgroundColor = "#f0f0f0";
          
          // Ensure the item is visible by scrolling if needed
          const selectedItem = items[this.selectedIndex];
          const listRect = this.resultsList.getBoundingClientRect();
          const itemRect = selectedItem.getBoundingClientRect();
          
          if (itemRect.bottom > listRect.bottom) {
            this.resultsList.scrollTop += (itemRect.bottom - listRect.bottom);
          } else if (itemRect.top < listRect.top) {
            this.resultsList.scrollTop -= (listRect.top - itemRect.top);
          }
        }
      },
      
      closeSearchResults: function() {
        console.log("Closing search results");
        this.resultsContainer.style.display = "none";
        
        // Clear results list
        while (this.resultsList.firstChild) {
          this.resultsList.removeChild(this.resultsList.firstChild);
        }
        
        this.results = [];
        this.selectedIndex = -1;
      },
      
      // Debug function to show the structure of the search form
      logSearchFormStructure: function() {
        console.log("Search form structure:");
        
        const logElement = (element, depth = 0) => {
          if (!element) return;
          
          const indent = ' '.repeat(depth * 2);
          const tagName = element.tagName.toLowerCase();
          const id = element.id ? `#${element.id}` : '';
          const classes = element.className ? `.${element.className.replace(/\s+/g, '.')}` : '';
          const position = getComputedStyle(element).position;
          
          console.log(`${indent}${tagName}${id}${classes} (position: ${position})`);
          
          // Log children recursively
          Array.from(element.children).forEach(child => {
            logElement(child, depth + 1);
          });
        };
        
        logElement(this.container);
      }
    };
    
    // Initialize when DOM is ready
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
  export default function initDocsWebSearch() {
    console.log("External initDocsWebSearch call");
    // This will reinitialize the search if needed
    if (window.initDocsWebSearch) {
      window.initDocsWebSearch();
    }
  }