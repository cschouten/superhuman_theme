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
    
    // Function to wrap whichever search button is present on the page
    function wrapSearchButtons() {
      // Start timer for this specific attempt
      const attemptStartTime = performance.now();
      
      // Check for home page search button
      const homeSearchButton = document.querySelector('#docsSearch form.search.search-full input[type="submit"], #docsSearch form.search.search-full input[name="commit"]');
      if (homeSearchButton && !homeSearchButton.parentElement.classList.contains('search-button-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-button-wrapper';
        homeSearchButton.parentNode.insertBefore(wrapper, homeSearchButton);
        wrapper.appendChild(homeSearchButton);

        console.log('Home search button wrapped');

        // Add a class to the form to indicate wrapping is complete
        const form = homeSearchButton.closest('form.search.search-full');
        if (form) form.classList.add('search-wrapped');
        
        // Calculate time taken
        const attemptEndTime = performance.now();
        const attemptDuration = attemptEndTime - attemptStartTime;
        console.log(`Wrapping completed in ${attemptDuration.toFixed(2)}ms.`);
        
        // Mark as done
        try {
          sessionStorage.setItem(wrappedKey, 'true');
          const totalTime = attemptEndTime - startTime;
          console.log(`✅ Search button wrapped successfully in ${totalTime.toFixed(2)}ms total time.`);
        } catch (e) {
          console.error('Could not save wrapped state:', e);
        }
        
        return true;
      }
      
      // Check for sidebar search button
      const sidebarButton = document.querySelector('form.search.search-full.sidebar-search.sm input[type="submit"], form.search.search-full.sidebar-search.sm input[name="commit"]');
      if (sidebarButton && !sidebarButton.parentElement.classList.contains('search-button-wrapper-sidebar')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-button-wrapper-sidebar';
        sidebarButton.parentNode.insertBefore(wrapper, sidebarButton);
        wrapper.appendChild(sidebarButton);
        
        console.log('Sidebar search button wrapped');

        // Add a class to the form to indicate wrapping is complete
        const form = homeSearchButton.closest('form.search.search-full');
        if (form) form.classList.add('search-wrapped');
        
        // Calculate time taken
        const attemptEndTime = performance.now();
        const attemptDuration = attemptEndTime - attemptStartTime;
        console.log(`Wrapping completed in ${attemptDuration.toFixed(2)}ms.`);
        
        // Mark as done
        try {
          sessionStorage.setItem(wrappedKey, 'true');
          const totalTime = attemptEndTime - startTime;
          console.log(`✅ Search button wrapped successfully in ${totalTime.toFixed(2)}ms total time.`);
        } catch (e) {
          console.error('Could not save wrapped state:', e);
        }
        
        return true;
      }
      
      // If we get here, no buttons were found or they were already wrapped
      console.log('No unwrapped search buttons found on this page.');
      return false;
    }
    
    // Try immediately
    console.log('🔍 Starting search button wrapper...');
    if (wrapSearchButtons()) {
      return; // Exit early if successful
    }
    
    // Set up a shorter-lived observer
    console.log('No buttons wrapped on first try. Setting up observer...');
    
    const observer = new MutationObserver(() => {
      if (wrapSearchButtons()) {
        observer.disconnect();
      }
    });
    
    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Try on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      if (wrapSearchButtons()) {
        observer.disconnect();
      }
    });
    
    // Final attempt with much shorter timeout
    setTimeout(() => {
      wrapSearchButtons();
      
      // Calculate final time
      const finalTime = performance.now() - startTime;
      console.log(`Search button wrapper finished in ${finalTime.toFixed(2)}ms total.`);
      
      observer.disconnect();
    }, 50); // Reduced timeout to 50ms
  })();
  
  export default {};