/**
 * Superhuman-style docs search for Zendesk Help Center
 */
(function($) {
    // Key codes for keyboard navigation
    const ENTER_KEY = 13;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const ESC_KEY = 27;
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
  
    // Initialize the search functionality
    window.initDocsWebSearch = function() {
      new DocsWebSearch($("#searchBar"));
    };
  
    // Main search class
    function DocsWebSearch(element) {
      if (!element.length) return;
  
      this.$el = $(element);
      this.ui = {
        save: this.$el.find('button[type="submit"]'),
        input: this.$el.find('input[type="text"]'),
        resultContainer: this.$el.find("#serp-dd"),
        resultsList: this.$el.find("ul.result"),
        result: this.$el.find("li")
      };
  
      // Create result container if it doesn't exist
      if (!this.ui.resultContainer.length) {
        this.ui.resultContainer = $('<div id="serp-dd" class="sb" style="display: none;"></div>');
        this.$el.append(this.ui.resultContainer);
      }
  
      // Create results list if it doesn't exist
      if (!this.ui.resultsList.length) {
        this.ui.resultsList = $('<ul class="result"></ul>');
        this.ui.resultContainer.append(this.ui.resultsList);
      }
  
      // Set up event handlers
      this.ui.save.on("mousedown", $.proxy(function() {
        this.navigating = true;
      }, this));
  
      this.ui.save.on("click", $.proxy(function(e) {
        const query = this.ui.input.val();
        if (query == null || query.length == 0) {
          e.preventDefault();
          e.stopPropagation();
          this.ui.input.addClass("error");
          this.navigating = false;
        }
      }, this));
  
      this.ui.input.on("keydown", $.proxy(this.onKeyDown, this));
      this.ui.input.on("keyup", $.proxy(this.onKeyUp, this));
      this.ui.input.on("focus", $.proxy(this.onFocus, this));
      this.ui.input.on("blur", $.proxy(this.onBlur, this));
  
      this.ui.resultsList.on("click", "li a", $.proxy(function(e) {
        const href = $(e.target).attr("href");
        if (href) {
          e.preventDefault();
          this.recordSearchAndNavigate(href);
        }
      }, this));
  
      this.selectedIndex = -1;
    }
  
    DocsWebSearch.prototype = {
      // Handle input field blur
      onBlur: function(e) {
        if (this.delayCloseOnBlur) {
          this.closeTimeoutId = setTimeout($.proxy(this.closeSearchResults, this), 400);
        } else {
          this.closeSearchResults();
        }
        this.delayCloseOnBlur = false;
      },
  
      // Handle input field focus
      onFocus: function(e) {
        if (this.ui.input.val()) {
          this.doSearch();
        }
      },
  
      // Handle keydown events
      onKeyDown: function(e) {
        // Prevent default behavior for enter, up, and down keys
        if (e.which == ENTER_KEY || e.which == UP_KEY || e.which == DOWN_KEY) {
          e.preventDefault();
        }
      },
  
      // Handle keyup events
      onKeyUp: function(e) {
        this.noResults = false;
        this.ui.resultsList.find("#noResults").remove();
        this.ui.input.removeClass("error");
  
        // Hide results container if there are no results
        if (this.ui.resultsList.find("li").length == 0) {
          this.ui.resultContainer.hide();
        }
  
        // Handle different key presses
        if (e.which == ENTER_KEY) {
          // Enter key pressed - navigate or submit form
          if (this.selectedIndex != null && this.selectedIndex >= 0) {
            const href = $(this.ui.resultsList.find("li").get(this.selectedIndex)).find("a").attr("href");
            if (href) {
              this.recordSearchAndNavigate(href);
            }
          } else if (this.ui.input.val().length > 0) {
            this.ui.save.click();
          } else if (!this.ui.input.val()) {
            this.ui.input.addClass("error");
          }
          this.stopSearchTimer();
        } else if (e.which == ESC_KEY) {
          // Escape key pressed - clear input and close results
          this.ui.input.val("");
          this.closeSearchResults();
        } else if (e.which == UP_KEY && this.articles && this.articles.length) {
          // Up arrow pressed - navigate up in results
          this.arrow("up");
        } else if (e.which == DOWN_KEY && this.articles && this.articles.length) {
          // Down arrow pressed - navigate down in results
          this.arrow("down");
        } else if (e.which != LEFT_KEY && e.which != RIGHT_KEY && e.which != ESC_KEY) {
          // Any other key pressed - start search timer
          this.startSearchTimer();
        }
      },
  
      // Start timer for search to avoid too many requests
      startSearchTimer: function() {
        clearTimeout(this.searchTimerId);
        this.searchTimerId = setTimeout($.proxy(this.checkSearch, this), 200);
      },
  
      // Stop search timer
      stopSearchTimer: function() {
        clearTimeout(this.searchTimerId);
      },
  
      // Check if search should be performed
      checkSearch: function() {
        const query = this.ui.input.val();
        if (query && query.length) {
          this.doSearch();
        } else {
          this.closeSearchResults();
          this.lastQueryValue = query;
        }
      },
  
      // Perform search
      doSearch: function() {
        const query = this.ui.input.val();
        const data = {
          query: query
        };
        this.lastQueryValue = query;
  
        // Abort previous request if still in progress
        if (this.queryXhr) {
          this.queryXhr.abort();
        }
  
        this.searching = true;
  
        // Make AJAX request to Zendesk search API
        this.queryXhr = $.ajax({
          url: "/api/v2/help_center/articles/search.json",
          data: {
            query: query,
            per_page: 10
          },
          type: "GET"
        }).done($.proxy(function(response) {
          if (response && response.results && response.results.length > 0) {
            this.noResults = false;
            this.articles = response.results;
            this.count = response.count;
          } else {
            this.noResults = this.ui.input.val() == this.lastQueryValue;
            this.count = 0;
            this.articles = [];
          }
          this.searching = false;
          this.selectedIndex = -1;
          this.refresh();
        }, this)).fail($.proxy(function() {
          this.noResults = true;
          this.count = 0;
          this.articles = [];
          this.searching = false;
          this.selectedIndex = -1;
          this.refresh();
        }, this));
      },
  
      // Record search for analytics
      recordSearch: function() {
        const query = this.ui.input.val();
        
        if (this.queryHasNotChanged(query)) {
          return $.Deferred().resolve().promise();
        }
        
        this.lastRecordedQueryValue = query;
        
        // In Zendesk, you might want to use their analytics or events API
        // This is a placeholder - implement based on your needs
        return $.post("/api/v2/help_center/search_events", {
          query: query
        });
      },
  
      // Record search and navigate to result
      recordSearchAndNavigate: function(url) {
        this.navigating = true;
        this.recordSearch().done(function() {
          window.location = url;
        });
      },
  
      // Check if query has changed
      queryHasNotChanged: function(query) {
        return !query || query === this.lastRecordedQueryValue;
      },
  
      // Refresh search results
      refresh: function() {
        this.ui.resultsList.empty();
        this.ui.resultContainer.hide();
  
        if (this.articles && this.articles.length) {
          for (let i = 0; i < this.articles.length; i++) {
            const article = this.articles[i];
            const listItem = $("<li></li>");
            
            if (i == this.selectedIndex) {
              listItem.addClass("active");
            }
            
            // Handle https protocol
            if (window.location.protocol.indexOf("https") != -1 && article.html_url) {
              article.html_url = article.html_url.replace("http://", "https://");
            }
            
            const link = $('<a href="' + article.html_url + '"></a>').text(article.title);
            
            link.on("mousedown", $.proxy(function(e) {
              this.delayCloseOnBlur = true;
            }, this)).on("mouseup", $.proxy(function(e) {
              clearTimeout(this.closeTimeoutId);
            }, this));
            
            listItem.append(link);
            listItem.on("mouseover", $.proxy(this.hover, this));
            
            this.ui.resultsList.append(listItem);
          }
          
          this.ui.resultsList.show();
          this.ui.resultContainer.show();
        } else if (this.noResults) {
          this.ui.resultsList.append('<li class="noResults">No results found</li>');
          this.ui.resultContainer.show();
        }
      },
  
      // Close search results
      closeSearchResults: function() {
        this.ui.resultsList.empty();
        this.ui.resultContainer.hide();
        
        if (!this.navigating) {
          this.recordSearch();
        }
      },
  
      // Handle arrow key navigation
      arrow: function(direction) {
        if (direction == "up") {
          this.selectedIndex = this.selectedIndex == -1 ? this.articles.length - 1 : this.selectedIndex - 1;
        } else if (direction == "down") {
          this.selectedIndex = this.selectedIndex == -1 ? 0 : this.selectedIndex + 1;
        }
        
        if (this.selectedIndex >= this.articles.length) {
          this.selectedIndex = -1;
        }
        
        this.ui.resultsList.find("li").removeClass("active");
        
        if (this.selectedIndex != -1) {
          const item = this.ui.resultsList.find("li").get(this.selectedIndex);
          if (item) {
            $(item).addClass("active");
            
            // Handle scrolling if necessary
            const itemTop = $(item).position().top;
            const scrollTop = this.ui.resultsList.scrollTop();
            const containerHeight = this.ui.resultsList.height();
            const itemHeight = $(item).height();
            
            const bottomPos = scrollTop + containerHeight - itemHeight;
            const innerHeight = this.ui.resultsList.innerHeight();
            const minScrollTop = innerHeight < bottomPos ? innerHeight - containerHeight : scrollTop;
            
            if (itemTop < minScrollTop || itemTop > bottomPos) {
              this.ui.resultsList.scrollTop(itemTop);
            }
          }
        }
      },
  
      // Handle hover over search results
      hover: function(e) {
        let target = $(e.target);
        if (!target.is("li")) {
          target = target.closest("li");
        }
        
        this.selectedIndex = this.ui.resultsList.find("li").index(target);
        this.ui.resultsList.find(".active").removeClass("active");
        target.addClass("active");
      }
    };
  
    // Initialize search when document is ready
    $(document).ready(function() {
      initDocsWebSearch();
    });
  
  })(jQuery);