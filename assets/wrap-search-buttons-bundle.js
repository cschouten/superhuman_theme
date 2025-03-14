(function() {
    // Check if we've already wrapped buttons in this session
    const wrappedKey = 'search-buttons-wrapped';
    const sessionWrapped = sessionStorage.getItem(wrappedKey);
    
    // If we've already wrapped buttons in this session, exit early
    if (sessionWrapped === 'true') {
      return;
    }
    
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
      
      // If we managed to wrap both buttons, mark as done
      if (wrapped === 2) {
        try {
          // Remember that we've wrapped buttons in this session
          sessionStorage.setItem(wrappedKey, 'true');
        } catch (e) {
          // Handle any storage errors silently
          console.error('Could not save wrapped state:', e);
        }
        return true;
      }
      
      return false;
    }
    
    // Try immediately
    if (wrapSearchButtons()) {
      return;
    }
    
    // Set up observers and fallbacks if needed
    const observer = new MutationObserver(() => {
      if (wrapSearchButtons()) {
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    document.addEventListener('DOMContentLoaded', () => {
      if (wrapSearchButtons()) {
        observer.disconnect();
      }
    });
    
    setTimeout(() => {
      wrapSearchButtons();
      observer.disconnect();
    }, 200);
  })();
  
  export default {};