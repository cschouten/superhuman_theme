// wrapSearchButtons.js - Add this as a separate script in the <head>
(function() {
    // Function to attempt wrapping the search buttons
    function wrapSearchButtons() {
      const allSearchButtons = document.querySelectorAll('form.search.search-full input[type="submit"], form.search.search-full input[name="commit"]');
      
      if (allSearchButtons.length === 0) return false;
      
      allSearchButtons.forEach(searchButton => {
        // Skip if already wrapped
        if (searchButton.parentElement.classList.contains('search-button-wrapper') || 
            searchButton.parentElement.classList.contains('search-button-wrapper-sidebar')) {
          return;
        }
        
        // Create wrapper
        const wrapper = document.createElement('div');
        const isSidebarSearch = searchButton.closest('form.search.search-full.sidebar-search.sm') !== null;
        wrapper.className = isSidebarSearch ? 'search-button-wrapper-sidebar' : 'search-button-wrapper';
        
        // Wrap the button
        searchButton.parentNode.insertBefore(wrapper, searchButton);
        wrapper.appendChild(searchButton);
      });
      
      return true;
    }
    
    // Try immediately
    if (!wrapSearchButtons()) {
      // Set up a more aggressive approach with both strategies
      
      // 1. Try on DOMContentLoaded
      document.addEventListener('DOMContentLoaded', wrapSearchButtons);
      
      // 2. Use MutationObserver for dynamic content
      const observer = new MutationObserver(function() {
        if (wrapSearchButtons()) {
          // If successful, disconnect the observer
          this.disconnect();
        }
      });
      
      // Start observing with configuration
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
      
      // 3. Fallback: try a few times with setTimeout
      let attempts = 0;
      const maxAttempts = 10;
      const interval = setInterval(function() {
        if (wrapSearchButtons() || ++attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 50);
    }
  })();