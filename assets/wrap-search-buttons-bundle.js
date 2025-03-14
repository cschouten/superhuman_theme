// Immediately execute and export
(function() {
    // Use a more performant selector approach
    function wrapSearchButtons() {
      // Directly target sidebar search buttons first - most specific case
      const sidebarButtons = document.querySelectorAll('form.search.search-full.sidebar-search.sm input[type="submit"], form.search.search-full.sidebar-search.sm input[name="commit"]');
      
      for (const button of sidebarButtons) {
        if (!button.parentElement.classList.contains('search-button-wrapper-sidebar')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'search-button-wrapper-sidebar';
          button.parentNode.insertBefore(wrapper, button);
          wrapper.appendChild(button);
        }
      }
      
      // Handle non-sidebar buttons separately
      const regularButtons = document.querySelectorAll('form.search.search-full:not(.sidebar-search) input[type="submit"], form.search.search-full:not(.sidebar-search) input[name="commit"]');
      
      for (const button of regularButtons) {
        if (!button.parentElement.classList.contains('search-button-wrapper')) {
          const wrapper = document.createElement('div');
          wrapper.className = 'search-button-wrapper';
          button.parentNode.insertBefore(wrapper, button);
          wrapper.appendChild(button);
        }
      }
      
      return sidebarButtons.length > 0 || regularButtons.length > 0;
    }
    
    // Try immediately on script load (highest priority)
    if (wrapSearchButtons()) {
      return; // Success on first try, exit early
    }
    
    // If buttons aren't available yet, set up more aggressive strategies
    
    // 1. Create an optimized observer 
    const observer = new MutationObserver((mutations) => {
      // Only look at added nodes for performance
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          if (wrapSearchButtons()) {
            observer.disconnect();
            return;
          }
        }
      }
    });
    
    // Start with more targeted observation
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      // If sidebar exists, just observe it (more efficient)
      observer.observe(sidebar, { childList: true, subtree: true });
    } else {
      // Fallback to observing the body
      observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // 2. Set a single timeout as fallback (simplifies the approach)
    setTimeout(() => {
      wrapSearchButtons();
      observer.disconnect();
    }, 100);
    
    // 3. Also try on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      wrapSearchButtons();
      observer.disconnect();
    });
  })();
  
  export default {};