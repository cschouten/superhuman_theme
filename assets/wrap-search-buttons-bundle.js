(function() {
    // Function to wrap both the home page and sidebar search buttons
    function wrapSearchButtons() {
      let wrapped = 0;
      
      // 1. Home page search button
      const homeSearchButton = document.querySelector('#docsSearch form.search.search-full input[type="submit"], #docsSearch form.search.search-full input[name="commit"]');
      if (homeSearchButton && !homeSearchButton.parentElement.classList.contains('search-button-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-button-wrapper';
        homeSearchButton.parentNode.insertBefore(wrapper, homeSearchButton);
        wrapper.appendChild(homeSearchButton);
        wrapped++;
      }
      
      // 2. Sidebar search button
      const sidebarButton = document.querySelector('form.search.search-full.sidebar-search.sm input[type="submit"], form.search.search-full.sidebar-search.sm input[name="commit"]');
      if (sidebarButton && !sidebarButton.parentElement.classList.contains('search-button-wrapper-sidebar')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-button-wrapper-sidebar';
        sidebarButton.parentNode.insertBefore(wrapper, sidebarButton);
        wrapper.appendChild(sidebarButton);
        wrapped++;
      }
      
      return wrapped === 2; // Return true when both buttons are wrapped
    }
    
    // Try immediately first
    if (wrapSearchButtons()) {
      return; // Exit early if both buttons wrapped successfully
    }
    
    // If not all buttons were wrapped, set up observers and fallbacks
    
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(wrapSearchButtons);
    
    // Set up mutation observer to watch for DOM changes
    const observer = new MutationObserver(() => {
      if (wrapSearchButtons()) {
        observer.disconnect(); // Stop observing once both buttons are wrapped
      }
    });
    
    // Start observing the document
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Try again on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      if (wrapSearchButtons()) {
        observer.disconnect();
      }
    });
    
    // Final fallback with timeout
    setTimeout(() => {
      wrapSearchButtons();
      observer.disconnect();
    }, 200);
  })();
  
  export default {};