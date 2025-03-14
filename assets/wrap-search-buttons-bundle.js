(function() {
    // Check if we've already wrapped buttons in this session
    const wrappedKey = 'search-buttons-wrapped';
    const sessionWrapped = sessionStorage.getItem(wrappedKey);
    
    // Start the overall timer
    const startTime = performance.now();
    
    // If we've already wrapped buttons in this session, exit early
    if (sessionWrapped === 'true') {
      console.log('Search buttons already wrapped in this session. Skipping.');
      return;
    }
    
    // Function to wrap both the home page and sidebar search buttons
    function wrapSearchButtons() {
      // Start timer for this specific attempt
      const attemptStartTime = performance.now();
      
      let wrapped = 0;
      
      // 1. Home page search button
      const homeSearchButton = document.querySelector('#docsSearch form.search.search-full input[type="submit"], #docsSearch form.search.search-full input[name="commit"]');
      if (homeSearchButton && !homeSearchButton.parentElement.classList.contains('search-button-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-button-wrapper';
        homeSearchButton.parentNode.insertBefore(wrapper, homeSearchButton);
        wrapper.appendChild(homeSearchButton);

        // Add a class to the form to indicate wrapping is complete
        const form = homeSearchButton.closest('form.search.search-full');
        if (form) form.classList.add('search-wrapped');
        
        console.log('Home search button wrapped');
        wrapped++;
      }
      
      // 2. Sidebar search button
      const sidebarButton = document.querySelector('form.search.search-full.sidebar-search.sm input[type="submit"], form.search.search-full.sidebar-search.sm input[name="commit"]');
      if (sidebarButton && !sidebarButton.parentElement.classList.contains('search-button-wrapper-sidebar')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-button-wrapper-sidebar';
        sidebarButton.parentNode.insertBefore(wrapper, sidebarButton);
        wrapper.appendChild(sidebarButton);

        // Add a class to the form to indicate wrapping is complete
        const form = homeSearchButton.closest('form.search.search-full');
        if (form) form.classList.add('search-wrapped');
        
        console.log('Sidebar search button wrapped');
        wrapped++;
      }
      
      // Calculate time taken for this attempt
      const attemptEndTime = performance.now();
      const attemptDuration = attemptEndTime - attemptStartTime;
      console.log(`Wrapping attempt completed in ${attemptDuration.toFixed(2)}ms. Wrapped ${wrapped} button(s).`);
      
      // If we managed to wrap both buttons, mark as done
      if (wrapped === 2) {
        try {
          // Remember that we've wrapped buttons in this session
          sessionStorage.setItem(wrappedKey, 'true');
          
          // Calculate total time from script start
          const totalTime = attemptEndTime - startTime;
          console.log(`✅ All search buttons wrapped successfully in ${totalTime.toFixed(2)}ms total time.`);
        } catch (e) {
          console.error('Could not save wrapped state:', e);
        }
        return true;
      }
      
      return false;
    }
    
    // Try immediately
    console.log('🔍 Starting search button wrapper...');
    if (wrapSearchButtons()) {
      return;
    }
    
    // Set up observers and fallbacks if needed
    console.log('Not all buttons wrapped on first try. Setting up observers...');
    
    const observer = new MutationObserver(() => {
      console.log('DOM mutation detected, trying to wrap buttons again...');
      if (wrapSearchButtons()) {
        console.log('All buttons wrapped after DOM mutation. Disconnecting observer.');
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOMContentLoaded fired, trying to wrap buttons again...');
      if (wrapSearchButtons()) {
        console.log('All buttons wrapped on DOMContentLoaded. Disconnecting observer.');
        observer.disconnect();
      }
    });
    
    setTimeout(() => {
      console.log('Timeout reached, trying one last time to wrap buttons...');
      wrapSearchButtons();
      
      // Calculate final time regardless of success
      const finalTime = performance.now() - startTime;
      console.log(`Search button wrapper finished in ${finalTime.toFixed(2)}ms total.`);
      
      observer.disconnect();
    }, 50);
  })();
  
  export default {};