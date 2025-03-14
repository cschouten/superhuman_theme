(function() {
    // Simple function to find and wrap buttons
    function wrapSearchButtons() {
      // Check for home page search button
      const homeSearchButton = document.querySelector('#docsSearch form.search.search-full input[type="submit"], #docsSearch form.search.search-full input[name="commit"]');
      if (homeSearchButton && !homeSearchButton.parentElement.classList.contains('search-button-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-button-wrapper';
        homeSearchButton.parentNode.insertBefore(wrapper, homeSearchButton);
        wrapper.appendChild(homeSearchButton);
        
        // CRITICAL: Force the button to be visible directly
        homeSearchButton.style.setProperty('visibility', 'visible', 'important');
        console.log('Home search button wrapped and made visible');
        return true;
      }
      
      // Check for sidebar search button
      const sidebarButton = document.querySelector('form.search.search-full.sidebar-search.sm input[type="submit"], form.search.search-full.sidebar-search.sm input[name="commit"]');
      if (sidebarButton && !sidebarButton.parentElement.classList.contains('search-button-wrapper-sidebar')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-button-wrapper-sidebar';
        sidebarButton.parentNode.insertBefore(wrapper, sidebarButton);
        wrapper.appendChild(sidebarButton);
        
        // CRITICAL: Force the button to be visible directly
        sidebarButton.style.setProperty('visibility', 'visible', 'important');
        console.log('Sidebar search button wrapped and made visible');
        return true;
      }
      
      return false;
    }
    
    // Try immediately
    if (wrapSearchButtons()) {
      return;
    }
    
    // Simple retry with MutationObserver
    const observer = new MutationObserver(() => {
      if (wrapSearchButtons()) {
        observer.disconnect();
      }
    });
    
    // Start observing
    observer.observe(document, { childList: true, subtree: true });
    
    // Final attempt with timeout
    setTimeout(() => {
      wrapSearchButtons();
      observer.disconnect();
    }, 100);
  })();
  
  export default {};