// Add this to your page to debug
function initDocsWebSearch() {
    console.log("Debug script loaded");
    
    // Check if jQuery is available
    if (typeof jQuery === 'undefined') {
      console.error("jQuery is not loaded!");
      return;
    }
    
    console.log("jQuery version:", jQuery.fn.jquery);
    
    // Wait for DOM to be fully loaded
    jQuery(document).ready(function() {
      console.log("DOM ready");
      
      // Check if searchBar exists
      const searchBar = jQuery("#searchBar");
      console.log("Search bar element:", searchBar.length ? "Found" : "Not found");
      
      // Check input element
      const searchInput = jQuery('#searchBar input[name="query"]');
      console.log("Search input element:", searchInput.length ? "Found" : "Not found");
    });
    
    // Return something useful if needed
    return {
      initialized: true
    };
  }
  
  // Self-invoking function to run immediately
  (function() {
    console.log("docsWebSearch module loaded");
    // You can still run code here that executes when the module loads
  })();
  
  // export the function for use in other modules
  export default initDocsWebSearch;

  // /**
//  * Superhuman-style docs search for Zendesk Help Center
//  */
// (function($) {
//     console.log("DocsWebSearch script loaded");
  
//     // Key codes for keyboard navigation
//     const ENTER_KEY = 13;
//     const UP_KEY = 38;
//     const DOWN_KEY = 40;
//     const ESC_KEY = 27;
//     const LEFT_KEY = 37;
//     const RIGHT_KEY = 39;
    
//     // Initialize the search functionality
//     window.initDocsWebSearch = function() {
//       console.log("initDocsWebSearch called");
//       const $searchBar = $("#searchBar");
//       console.log("Search bar found:", $searchBar.length, $searchBar);
      
//       if ($searchBar.length) {
//         new DocsWebSearch($searchBar);
//       } else {
//         console.error("No search bar found with selector #searchBar");
//       }
//     };
    
//     // Main search class
//     function DocsWebSearch(element) {
//       console.log("Creating DocsWebSearch instance with element:", element);
      
//       if (!element.length) {
//         console.error("No search element found");
//         return;
//       }
      
//       this.$el = $(element);
//       this.ui = {
//         save: this.$el.find('button[type="submit"]'),
//         input: this.$el.find('input[name="query"]'),
//         resultContainer: this.$el.find("#serp-dd"),
//         resultsList: this.$el.find("ul.result"),
//         result: this.$el.find("li")
//       };
      
//       console.log("UI elements found:", {
//         save: this.ui.save.length > 0 ? "Yes" : "No",
//         input: this.ui.input.length > 0 ? "Yes" : "No",
//         resultContainer: this.ui.resultContainer.length > 0 ? "Yes" : "No",
//         resultsList: this.ui.resultsList.length > 0 ? "Yes" : "No"
//       });
      
//       // Create result container if it doesn't exist
//       if (!this.ui.resultContainer.length) {
//         console.log("Creating result container as it doesn't exist");
//         this.ui.resultContainer = $('<div id="serp-dd" class="sb" style="display: none;"></div>');
//         this.$el.append(this.ui.resultContainer);
//       }
      
//       // Create results list if it doesn't exist
//       if (!this.ui.resultsList.length) {
//         console.log("Creating results list as it doesn't exist");
//         this.ui.resultsList = $('<ul class="result"></ul>');
//         this.ui.resultContainer.append(this.ui.resultsList);
//       }
      
//       // Set up event handlers
//       console.log("Setting up event handlers");
      
//       this.ui.save.on("mousedown", $.proxy(function() {
//         console.log("Save button mousedown");
//         this.navigating = true;
//       }, this));
      
//       this.ui.save.on("click", $.proxy(function(e) {
//         console.log("Save button clicked");
//         const query = this.ui.input.val();
//         console.log("Query on click:", query);
        
//         if (query == null || query.length == 0) {
//           console.log("Empty query, preventing default");
//           e.preventDefault();
//           e.stopPropagation();
//           this.ui.input.addClass("error");
//           this.navigating = false;
//         }
//       }, this));
      
//       this.ui.input.on("keydown", $.proxy(this.onKeyDown, this));
//       this.ui.input.on("keyup", $.proxy(this.onKeyUp, this));
//       this.ui.input.on("focus", $.proxy(this.onFocus, this));
//       this.ui.input.on("blur", $.proxy(this.onBlur, this));
      
//       this.ui.resultsList.on("click", "li a", $.proxy(function(e) {
//         console.log("Result item clicked");
//         const href = $(e.target).attr("href");
//         console.log("Result href:", href);
        
//         if (href) {
//           e.preventDefault();
//           this.recordSearchAndNavigate(href);
//         }
//       }, this));
      
//       this.selectedIndex = -1;
//       console.log("DocsWebSearch instance initialized");
//     }
    
//     DocsWebSearch.prototype = {
//       // Handle input field blur
//       onBlur: function(e) {
//         console.log("Input blur event");
        
//         if (this.delayCloseOnBlur) {
//           console.log("Delay close on blur, setting timeout");
//           this.closeTimeoutId = setTimeout($.proxy(this.closeSearchResults, this), 400);
//         } else {
//           console.log("Immediate close on blur");
//           this.closeSearchResults();
//         }
//         this.delayCloseOnBlur = false;
//       },
      
//       // Handle input field focus
//       onFocus: function(e) {
//         console.log("Input focus event, value:", this.ui.input.val());
        
//         if (this.ui.input.val()) {
//           console.log("Input has value, triggering search");
//           this.doSearch();
//         }
//       },
      
//       // Handle keydown events
//       onKeyDown: function(e) {
//         console.log("Key down event, key code:", e.which);
        
//         // Prevent default behavior for enter, up, and down keys
//         if (e.which == ENTER_KEY || e.which == UP_KEY || e.which == DOWN_KEY) {
//           console.log("Preventing default for navigation key");
//           e.preventDefault();
//         }
//       },
      
//       // Handle keyup events
//       onKeyUp: function(e) {
//         console.log("Key up event, key code:", e.which);
        
//         this.noResults = false;
//         this.ui.resultsList.find("#noResults").remove();
//         this.ui.input.removeClass("error");
        
//         // Hide results container if there are no results
//         if (this.ui.resultsList.find("li").length == 0) {
//           console.log("No results, hiding container");
//           this.ui.resultContainer.hide();
//         }
        
//         // Handle different key presses
//         if (e.which == ENTER_KEY) {
//           console.log("Enter key pressed");
//           // Enter key pressed - navigate or submit form
//           if (this.selectedIndex != null && this.selectedIndex >= 0) {
//             console.log("Item selected, index:", this.selectedIndex);
//             const href = $(this.ui.resultsList.find("li").get(this.selectedIndex)).find("a").attr("href");
//             console.log("Selected item href:", href);
            
//             if (href) {
//               this.recordSearchAndNavigate(href);
//             }
//           } else if (this.ui.input.val().length > 0) {
//             console.log("No item selected but has value, clicking save button");
//             this.ui.save.click();
//           } else if (!this.ui.input.val()) {
//             console.log("Empty input, adding error class");
//             this.ui.input.addClass("error");
//           }
//           this.stopSearchTimer();
//         } else if (e.which == ESC_KEY) {
//           console.log("Escape key pressed");
//           // Escape key pressed - clear input and close results
//           this.ui.input.val("");
//           this.closeSearchResults();
//         } else if (e.which == UP_KEY && this.articles && this.articles.length) {
//           console.log("Up arrow pressed");
//           // Up arrow pressed - navigate up in results
//           this.arrow("up");
//         } else if (e.which == DOWN_KEY && this.articles && this.articles.length) {
//           console.log("Down arrow pressed");
//           // Down arrow pressed - navigate down in results
//           this.arrow("down");
//         } else if (e.which != LEFT_KEY && e.which != RIGHT_KEY && e.which != ESC_KEY) {
//           console.log("Other key pressed, starting search timer");
//           // Any other key pressed - start search timer
//           this.startSearchTimer();
//         }
//       },
      
//       // Start timer for search to avoid too many requests
//       startSearchTimer: function() {
//         console.log("Starting search timer");
//         clearTimeout(this.searchTimerId);
//         this.searchTimerId = setTimeout($.proxy(this.checkSearch, this), 200);
//       },
      
//       // Stop search timer
//       stopSearchTimer: function() {
//         console.log("Stopping search timer");
//         clearTimeout(this.searchTimerId);
//       },
      
//       // Check if search should be performed
//       checkSearch: function() {
//         console.log("Checking search");
//         const query = this.ui.input.val();
//         console.log("Current query:", query);
        
//         if (query && query.length) {
//           console.log("Query has value, performing search");
//           this.doSearch();
//         } else {
//           console.log("Empty query, closing results");
//           this.closeSearchResults();
//           this.lastQueryValue = query;
//         }
//       },
      
//       // Perform search
//       doSearch: function() {
//         console.log("Performing search");
//         const query = this.ui.input.val();
//         console.log("Search query:", query);
        
//         const data = {
//           query: query
//         };
//         this.lastQueryValue = query;
        
//         // Abort previous request if still in progress
//         if (this.queryXhr) {
//           console.log("Aborting previous request");
//           this.queryXhr.abort();
//         }
        
//         this.searching = true;
//         console.log("Making AJAX request to Zendesk search API");
        
//         // Try different endpoints that might work with Zendesk
//         const endpoint = "/hc/en-us/search/autocomplete.json"; // Changed from /api/v2/help_center/articles/search.json
//         console.log("Using endpoint:", endpoint);
        
//         // Make AJAX request to Zendesk search API
//         this.queryXhr = $.ajax({
//           url: endpoint,
//           data: {
//             query: query,
//             per_page: 10
//           },
//           type: "GET"
//         }).done($.proxy(function(response) {
//           console.log("Search request successful, response:", response);
          
//           // Process different response formats
//           if (response && response.results && response.results.length > 0) {
//             console.log("Found results in response.results");
//             this.noResults = false;
//             this.articles = response.results;
//             this.count = response.count || response.results.length;
//           } else if (response && response.articles && response.articles.length > 0) {
//             console.log("Found results in response.articles");
//             this.noResults = false;
//             this.articles = response.articles;
//             this.count = response.count || response.articles.length;
//           } else if (response && Array.isArray(response) && response.length > 0) {
//             console.log("Found results in array response");
//             this.noResults = false;
//             this.articles = response;
//             this.count = response.length;
//           } else {
//             console.log("No results found in response");
//             this.noResults = this.ui.input.val() == this.lastQueryValue;
//             this.count = 0;
//             this.articles = [];
//           }
          
//           this.searching = false;
//           this.selectedIndex = -1;
//           this.refresh();
//         }, this)).fail($.proxy(function(jqXHR, textStatus, errorThrown) {
//           console.error("Search request failed:", textStatus, errorThrown);
//           console.log("Response:", jqXHR.responseText);
          
//           this.noResults = true;
//           this.count = 0;
//           this.articles = [];
//           this.searching = false;
//           this.selectedIndex = -1;
//           this.refresh();
//         }, this));
//       },
      
//       // Record search for analytics
//       recordSearch: function() {
//         console.log("Recording search");
//         const query = this.ui.input.val();
//         console.log("Query to record:", query);
        
//         if (this.queryHasNotChanged(query)) {
//           console.log("Query hasn't changed, skipping record");
//           return $.Deferred().resolve().promise();
//         }
        
//         this.lastRecordedQueryValue = query;
//         console.log("Query recorded");
        
//         // Return resolved promise since we're not actually recording
//         return $.Deferred().resolve().promise();
        
//         // In Zendesk, you might want to use their analytics or events API
//         // This is a placeholder - implement based on your needs
//         /*
//         return $.post("/api/v2/help_center/search_events", {
//           query: query
//         });
//         */
//       },
      
//       // Record search and navigate to result
//       recordSearchAndNavigate: function(url) {
//         console.log("Recording search and navigating to:", url);
//         this.navigating = true;
//         this.recordSearch().done(function() {
//           console.log("Navigation in progress to:", url);
//           window.location = url;
//         });
//       },
      
//       // Check if query has changed
//       queryHasNotChanged: function(query) {
//         const result = !query || query === this.lastRecordedQueryValue;
//         console.log("Query hasn't changed:", result);
//         return result;
//       },
      
//       // Refresh search results
//       refresh: function() {
//         console.log("Refreshing search results");
//         this.ui.resultsList.empty();
//         this.ui.resultContainer.hide();
        
//         if (this.articles && this.articles.length) {
//           console.log("Articles found, count:", this.articles.length);
          
//           for (let i = 0; i < this.articles.length; i++) {
//             const article = this.articles[i];
//             console.log("Processing article:", article.title || article.name || "Unnamed");
            
//             const listItem = $("<li></li>");
            
//             if (i == this.selectedIndex) {
//               listItem.addClass("active");
//             }
            
//             // Get the URL from the article depending on response format
//             const articleUrl = article.html_url || article.url || "#";
//             console.log("Article URL:", articleUrl);
            
//             // Handle https protocol
//             let finalUrl = articleUrl;
//             if (window.location.protocol.indexOf("https") != -1 && finalUrl) {
//               finalUrl = finalUrl.replace("http://", "https://");
//             }
            
//             // Get the title from the article depending on response format
//             const articleTitle = article.title || article.name || "Unnamed Article";
            
//             const link = $('<a href="' + finalUrl + '"></a>').text(articleTitle);
            
//             link.on("mousedown", $.proxy(function(e) {
//               console.log("Link mousedown");
//               this.delayCloseOnBlur = true;
//             }, this)).on("mouseup", $.proxy(function(e) {
//               console.log("Link mouseup");
//               clearTimeout(this.closeTimeoutId);
//             }, this));
            
//             listItem.append(link);
//             listItem.on("mouseover", $.proxy(this.hover, this));
            
//             this.ui.resultsList.append(listItem);
//           }
          
//           console.log("Showing results list and container");
//           this.ui.resultsList.show();
//           this.ui.resultContainer.show();
//         } else if (this.noResults) {
//           console.log("No results, showing message");
//           this.ui.resultsList.append('<li class="noResults">No results found</li>');
//           this.ui.resultContainer.show();
//         } else {
//           console.log("No results and not in 'no results' state");
//         }
//       },
      
//       // Close search results
//       closeSearchResults: function() {
//         console.log("Closing search results");
//         this.ui.resultsList.empty();
//         this.ui.resultContainer.hide();
        
//         if (!this.navigating) {
//           console.log("Not navigating, recording search");
//           this.recordSearch();
//         } else {
//           console.log("Navigating, not recording search");
//         }
//       },
      
//       // Handle arrow key navigation
//       arrow: function(direction) {
//         console.log("Arrow navigation:", direction);
        
//         if (direction == "up") {
//           this.selectedIndex = this.selectedIndex == -1 ? this.articles.length - 1 : this.selectedIndex - 1;
//         } else if (direction == "down") {
//           this.selectedIndex = this.selectedIndex == -1 ? 0 : this.selectedIndex + 1;
//         }
        
//         if (this.selectedIndex >= this.articles.length) {
//           this.selectedIndex = -1;
//         }
        
//         console.log("New selected index:", this.selectedIndex);
        
//         this.ui.resultsList.find("li").removeClass("active");
        
//         if (this.selectedIndex != -1) {
//           const item = this.ui.resultsList.find("li").get(this.selectedIndex);
//           if (item) {
//             console.log("Setting active item");
//             $(item).addClass("active");
            
//             // Handle scrolling if necessary
//             const itemTop = $(item).position().top;
//             const scrollTop = this.ui.resultsList.scrollTop();
//             const containerHeight = this.ui.resultsList.height();
//             const itemHeight = $(item).height();
            
//             console.log("Scroll metrics:", {
//               itemTop,
//               scrollTop,
//               containerHeight,
//               itemHeight
//             });
            
//             const bottomPos = scrollTop + containerHeight - itemHeight;
//             const innerHeight = this.ui.resultsList.innerHeight();
//             const minScrollTop = innerHeight < bottomPos ? innerHeight - containerHeight : scrollTop;
            
//             if (itemTop < minScrollTop || itemTop > bottomPos) {
//               console.log("Scrolling to item");
//               this.ui.resultsList.scrollTop(itemTop);
//             }
//           }
//         }
//       },
      
//       // Handle hover over search results
//       hover: function(e) {
//         console.log("Hover event");
//         let target = $(e.target);
//         if (!target.is("li")) {
//           console.log("Target is not li, finding closest li");
//           target = target.closest("li");
//         }
        
//         this.selectedIndex = this.ui.resultsList.find("li").index(target);
//         console.log("Hover selected index:", this.selectedIndex);
        
//         this.ui.resultsList.find(".active").removeClass("active");
//         target.addClass("active");
//       }
//     };
    
//     // Initialize search when document is ready
//     $(document).ready(function() {
//       console.log("Document ready, initializing docs web search");
//       initDocsWebSearch();
//     });
    
//   })(jQuery);