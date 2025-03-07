(function () {
    'use strict';
  
    // Original functionality preserved (all the existing code)
    // Key map
    const ENTER = 13;
    const ESCAPE = 27;
  
    function toggleNavigation(toggle, menu) {
      const isExpanded = menu.getAttribute("aria-expanded") === "true";
      menu.setAttribute("aria-expanded", !isExpanded);
      toggle.setAttribute("aria-expanded", !isExpanded);
    }
  
    function closeNavigation(toggle, menu) {
      menu.setAttribute("aria-expanded", false);
      toggle.setAttribute("aria-expanded", false);
      toggle.focus();
    }
  
    // Navigation
    window.addEventListener("DOMContentLoaded", () => {
      const menuButton = document.querySelector(".header .menu-button-mobile");
      const menuList = document.querySelector("#user-nav-mobile");
  
      if (menuButton && menuList) {
        menuButton.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleNavigation(menuButton, menuList);
        });
  
        menuList.addEventListener("keyup", (event) => {
          if (event.keyCode === ESCAPE) {
            event.stopPropagation();
            closeNavigation(menuButton, menuList);
          }
        });
      }
  
      // Toggles expanded aria to collapsible elements
      const collapsible = document.querySelectorAll(
        ".collapsible-nav, .collapsible-sidebar"
      );
  
      collapsible.forEach((element) => {
        const toggle = element.querySelector(
          ".collapsible-nav-toggle, .collapsible-sidebar-toggle"
        );
  
        if (toggle) {
          element.addEventListener("click", () => {
            toggleNavigation(toggle, element);
          });
  
          element.addEventListener("keyup", (event) => {
            if (event.keyCode === ESCAPE) {
              closeNavigation(toggle, element);
            }
          });
        }
      });
  
      // If multibrand search has more than 5 help centers or categories collapse the list
      const multibrandFilterLists = document.querySelectorAll(
        ".multibrand-filter-list"
      );
      multibrandFilterLists.forEach((filter) => {
        if (filter.children.length > 6) {
          // Display the show more button
          const trigger = filter.querySelector(".see-all-filters");
          if (trigger) {
            trigger.setAttribute("aria-hidden", false);
  
            // Add event handler for click
            trigger.addEventListener("click", (event) => {
              event.stopPropagation();
              trigger.parentNode.removeChild(trigger);
              filter.classList.remove("multibrand-filter-list--collapsed");
            });
          }
        }
      });
      
      // Initialize Dark Theme Components
      initDarkTheme();
    });
  
    const isPrintableChar = (str) => {
      return str.length === 1 && str.match(/^\S$/);
    };
  
    function Dropdown(toggle, menu) {
      this.toggle = toggle;
      this.menu = menu;
  
      this.menuPlacement = {
        top: menu.classList.contains("dropdown-menu-top"),
        end: menu.classList.contains("dropdown-menu-end"),
      };
  
      this.toggle.addEventListener("click", this.clickHandler.bind(this));
      this.toggle.addEventListener("keydown", this.toggleKeyHandler.bind(this));
      this.menu.addEventListener("keydown", this.menuKeyHandler.bind(this));
      document.body.addEventListener("click", this.outsideClickHandler.bind(this));
  
      const toggleId = this.toggle.getAttribute("id") || crypto.randomUUID();
      const menuId = this.menu.getAttribute("id") || crypto.randomUUID();
  
      this.toggle.setAttribute("id", toggleId);
      this.menu.setAttribute("id", menuId);
  
      this.toggle.setAttribute("aria-controls", menuId);
      this.menu.setAttribute("aria-labelledby", toggleId);
  
      this.menu.setAttribute("tabindex", -1);
      this.menuItems.forEach((menuItem) => {
        menuItem.tabIndex = -1;
      });
  
      this.focusedIndex = -1;
    }
  
    Dropdown.prototype = {
      get isExpanded() {
        return this.toggle.getAttribute("aria-expanded") === "true";
      },
  
      get menuItems() {
        return Array.prototype.slice.call(
          this.menu.querySelectorAll("[role='menuitem'], [role='menuitemradio']")
        );
      },
  
      dismiss: function () {
        if (!this.isExpanded) return;
  
        this.toggle.removeAttribute("aria-expanded");
        this.menu.classList.remove("dropdown-menu-end", "dropdown-menu-top");
        this.focusedIndex = -1;
      },
  
      open: function () {
        if (this.isExpanded) return;
  
        this.toggle.setAttribute("aria-expanded", true);
        this.handleOverflow();
      },
  
      handleOverflow: function () {
        var rect = this.menu.getBoundingClientRect();
  
        var overflow = {
          right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
          bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight,
        };
  
        if (overflow.right || this.menuPlacement.end) {
          this.menu.classList.add("dropdown-menu-end");
        }
  
        if (overflow.bottom || this.menuPlacement.top) {
          this.menu.classList.add("dropdown-menu-top");
        }
  
        if (this.menu.getBoundingClientRect().top < 0) {
          this.menu.classList.remove("dropdown-menu-top");
        }
      },
  
      focusByIndex: function (index) {
        if (!this.menuItems.length) return;
  
        this.menuItems.forEach((item, itemIndex) => {
          if (itemIndex === index) {
            item.tabIndex = 0;
            item.focus();
          } else {
            item.tabIndex = -1;
          }
        });
  
        this.focusedIndex = index;
      },
  
      focusFirstMenuItem: function () {
        this.focusByIndex(0);
      },
  
      focusLastMenuItem: function () {
        this.focusByIndex(this.menuItems.length - 1);
      },
  
      focusNextMenuItem: function (currentItem) {
        if (!this.menuItems.length) return;
  
        const currentIndex = this.menuItems.indexOf(currentItem);
        const nextIndex = (currentIndex + 1) % this.menuItems.length;
  
        this.focusByIndex(nextIndex);
      },
  
      focusPreviousMenuItem: function (currentItem) {
        if (!this.menuItems.length) return;
  
        const currentIndex = this.menuItems.indexOf(currentItem);
        const previousIndex =
          currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;
  
        this.focusByIndex(previousIndex);
      },
  
      focusByChar: function (currentItem, char) {
        char = char.toLowerCase();
  
        const itemChars = this.menuItems.map((menuItem) =>
          menuItem.textContent.trim()[0].toLowerCase()
        );
  
        const startIndex =
          (this.menuItems.indexOf(currentItem) + 1) % this.menuItems.length;
  
        // look up starting from current index
        let index = itemChars.indexOf(char, startIndex);
  
        // if not found, start from start
        if (index === -1) {
          index = itemChars.indexOf(char, 0);
        }
  
        if (index > -1) {
          this.focusByIndex(index);
        }
      },
  
      outsideClickHandler: function (e) {
        if (
          this.isExpanded &&
          !this.toggle.contains(e.target) &&
          !e.composedPath().includes(this.menu)
        ) {
          this.dismiss();
          this.toggle.focus();
        }
      },
  
      clickHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
  
        if (this.isExpanded) {
          this.dismiss();
          this.toggle.focus();
        } else {
          this.open();
          this.focusFirstMenuItem();
        }
      },
  
      toggleKeyHandler: function (e) {
        const key = e.key;
  
        switch (key) {
          case "Enter":
          case " ":
          case "ArrowDown":
          case "Down": {
            e.stopPropagation();
            e.preventDefault();
  
            this.open();
            this.focusFirstMenuItem();
            break;
          }
          case "ArrowUp":
          case "Up": {
            e.stopPropagation();
            e.preventDefault();
  
            this.open();
            this.focusLastMenuItem();
            break;
          }
          case "Esc":
          case "Escape": {
            e.stopPropagation();
            e.preventDefault();
  
            this.dismiss();
            this.toggle.focus();
            break;
          }
        }
      },
  
      menuKeyHandler: function (e) {
        const key = e.key;
        const currentElement = this.menuItems[this.focusedIndex];
  
        if (e.ctrlKey || e.altKey || e.metaKey) {
          return;
        }
  
        switch (key) {
          case "Esc":
          case "Escape": {
            e.stopPropagation();
            e.preventDefault();
  
            this.dismiss();
            this.toggle.focus();
            break;
          }
          case "ArrowDown":
          case "Down": {
            e.stopPropagation();
            e.preventDefault();
  
            this.focusNextMenuItem(currentElement);
            break;
          }
          case "ArrowUp":
          case "Up": {
            e.stopPropagation();
            e.preventDefault();
            this.focusPreviousMenuItem(currentElement);
            break;
          }
          case "Home":
          case "PageUp": {
            e.stopPropagation();
            e.preventDefault();
            this.focusFirstMenuItem();
            break;
          }
          case "End":
          case "PageDown": {
            e.stopPropagation();
            e.preventDefault();
            this.focusLastMenuItem();
            break;
          }
          case "Tab": {
            if (e.shiftKey) {
              e.stopPropagation();
              e.preventDefault();
              this.dismiss();
              this.toggle.focus();
            } else {
              this.dismiss();
            }
            break;
          }
          default: {
            if (isPrintableChar(key)) {
              e.stopPropagation();
              e.preventDefault();
              this.focusByChar(currentElement, key);
            }
          }
        }
      },
    };
  
    // Drodowns
    window.addEventListener("DOMContentLoaded", () => {
      const dropdowns = [];
      const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  
      dropdownToggles.forEach((toggle) => {
        const menu = toggle.nextElementSibling;
        if (menu && menu.classList.contains("dropdown-menu")) {
          dropdowns.push(new Dropdown(toggle, menu));
        }
      });
    });
  
    // Share
    window.addEventListener("DOMContentLoaded", () => {
      const links = document.querySelectorAll(".share a");
      links.forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
          event.preventDefault();
          window.open(anchor.href, "", "height = 500, width = 500");
        });
      });
    });
  
    // Vanilla JS debounce function, by Josh W. Comeau:
    // https://www.joshwcomeau.com/snippets/javascript/debounce/
    function debounce(callback, wait) {
      let timeoutId = null;
      return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          callback.apply(null, args);
        }, wait);
      };
    }
  
    // Define variables for search field
    let searchFormFilledClassName = "search-has-value";
    let searchFormSelector = "form[role='search']";
  
    // Clear the search input, and then return focus to it
    function clearSearchInput(event) {
      event.target
        .closest(searchFormSelector)
        .classList.remove(searchFormFilledClassName);
  
      let input;
      if (event.target.tagName === "INPUT") {
        input = event.target;
      } else if (event.target.tagName === "BUTTON") {
        input = event.target.previousElementSibling;
      } else {
        input = event.target.closest("button").previousElementSibling;
      }
      input.value = "";
      input.focus();
    }
  
    // Have the search input and clear button respond
    // when someone presses the escape key, per:
    // https://twitter.com/adambsilver/status/1152452833234554880
    function clearSearchInputOnKeypress(event) {
      const searchInputDeleteKeys = ["Delete", "Escape"];
      if (searchInputDeleteKeys.includes(event.key)) {
        clearSearchInput(event);
      }
    }
  
    // Create an HTML button that all users -- especially keyboard users --
    // can interact with, to clear the search input.
    // To learn more about this, see:
    // https://adrianroselli.com/2019/07/ignore-typesearch.html#Delete
    // https://www.scottohara.me/blog/2022/02/19/custom-clear-buttons.html
    function buildClearSearchButton(inputId) {
      const button = document.createElement("button");
      button.setAttribute("type", "button");
      button.setAttribute("aria-controls", inputId);
      button.classList.add("clear-button");
      const buttonLabel = window.searchClearButtonLabelLocalized;
      const icon = `<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' focusable='false' role='img' viewBox='0 0 12 12' aria-label='${buttonLabel}'><path stroke='currentColor' stroke-linecap='round' stroke-width='2' d='M3 9l6-6m0 6L3 3'/></svg>`;
      button.innerHTML = icon;
      button.addEventListener("click", clearSearchInput);
      button.addEventListener("keyup", clearSearchInputOnKeypress);
      return button;
    }
  
    // Append the clear button to the search form
    function appendClearSearchButton(input, form) {
      const searchClearButton = buildClearSearchButton(input.id);
      form.append(searchClearButton);
      if (input.value.length > 0) {
        form.classList.add(searchFormFilledClassName);
      }
    }
  
    // Add a class to the search form when the input has a value;
    // Remove that class from the search form when the input doesn't have a value.
    // Do this on a delay, rather than on every keystroke.
    const toggleClearSearchButtonAvailability = debounce((event) => {
      const form = event.target.closest(searchFormSelector);
      form.classList.toggle(
        searchFormFilledClassName,
        event.target.value.length > 0
      );
    }, 200);
  
    // Search
    window.addEventListener("DOMContentLoaded", () => {
      // Set up clear functionality for the search field
      const searchForms = [...document.querySelectorAll(searchFormSelector)];
      const searchInputs = searchForms.map((form) =>
        form.querySelector("input[type='search']")
      );
      searchInputs.forEach((input) => {
        appendClearSearchButton(input, input.closest(searchFormSelector));
        input.addEventListener("keyup", clearSearchInputOnKeypress);
        input.addEventListener("keyup", toggleClearSearchButtonAvailability);
      });

        document.querySelectorAll("form[role='search'], #searchBar").forEach(form => {
            form.addEventListener('submit', function(event) {
            const searchInput = this.querySelector('input[type="search"], .search-query');
            if (!searchInput || !searchInput.value.trim()) {
                // Prevent form submission if search is empty
                event.preventDefault();
            }
            });
        });
    });
  
    const key = "returnFocusTo";
  
    function saveFocus() {
      const activeElementId = document.activeElement.getAttribute("id");
      sessionStorage.setItem(key, "#" + activeElementId);
    }
  
    function returnFocus() {
      const returnFocusTo = sessionStorage.getItem(key);
      if (returnFocusTo) {
        sessionStorage.removeItem("returnFocusTo");
        const returnFocusToEl = document.querySelector(returnFocusTo);
        returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
      }
    }
  
    // Forms
    window.addEventListener("DOMContentLoaded", () => {
      // In some cases we should preserve focus after page reload
      returnFocus();
  
      // show form controls when the textarea receives focus or back button is used and value exists
      const commentContainerTextarea = document.querySelector(
        ".comment-container textarea"
      );
      const commentContainerFormControls = document.querySelector(
        ".comment-form-controls, .comment-ccs"
      );
  
      if (commentContainerTextarea) {
        commentContainerTextarea.addEventListener(
          "focus",
          function focusCommentContainerTextarea() {
            commentContainerFormControls.style.display = "block";
            commentContainerTextarea.removeEventListener(
              "focus",
              focusCommentContainerTextarea
            );
          }
        );
  
        if (commentContainerTextarea.value !== "") {
          commentContainerFormControls.style.display = "block";
        }
      }
  
      // Expand Request comment form when Add to conversation is clicked
      const showRequestCommentContainerTrigger = document.querySelector(
        ".request-container .comment-container .comment-show-container"
      );
      const requestCommentFields = document.querySelectorAll(
        ".request-container .comment-container .comment-fields"
      );
      const requestCommentSubmit = document.querySelector(
        ".request-container .comment-container .request-submit-comment"
      );
  
      if (showRequestCommentContainerTrigger) {
        showRequestCommentContainerTrigger.addEventListener("click", () => {
          showRequestCommentContainerTrigger.style.display = "none";
          Array.prototype.forEach.call(requestCommentFields, (element) => {
            element.style.display = "block";
          });
          requestCommentSubmit.style.display = "inline-block";
  
          if (commentContainerTextarea) {
            commentContainerTextarea.focus();
          }
        });
      }
  
      // Mark as solved button
      const requestMarkAsSolvedButton = document.querySelector(
        ".request-container .mark-as-solved:not([data-disabled])"
      );
      const requestMarkAsSolvedCheckbox = document.querySelector(
        ".request-container .comment-container input[type=checkbox]"
      );
      const requestCommentSubmitButton = document.querySelector(
        ".request-container .comment-container input[type=submit]"
      );
  
      if (requestMarkAsSolvedButton) {
        requestMarkAsSolvedButton.addEventListener("click", () => {
          requestMarkAsSolvedCheckbox.setAttribute("checked", true);
          requestCommentSubmitButton.disabled = true;
          requestMarkAsSolvedButton.setAttribute("data-disabled", true);
          requestMarkAsSolvedButton.form.submit();
        });
      }
  
      // Change Mark as solved text according to whether comment is filled
      const requestCommentTextarea = document.querySelector(
        ".request-container .comment-container textarea"
      );
  
      const usesWysiwyg =
        requestCommentTextarea &&
        requestCommentTextarea.dataset.helper === "wysiwyg";
  
      function isEmptyPlaintext(s) {
        return s.trim() === "";
      }
  
      function isEmptyHtml(xml) {
        const doc = new DOMParser().parseFromString(`<_>${xml}</_>`, "text/xml");
        const img = doc.querySelector("img");
        return img === null && isEmptyPlaintext(doc.children[0].textContent);
      }
  
      const isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;
  
      if (requestCommentTextarea) {
        requestCommentTextarea.addEventListener("input", () => {
          if (isEmpty(requestCommentTextarea.value)) {
            if (requestMarkAsSolvedButton) {
              requestMarkAsSolvedButton.innerText =
                requestMarkAsSolvedButton.getAttribute("data-solve-translation");
            }
          } else {
            if (requestMarkAsSolvedButton) {
              requestMarkAsSolvedButton.innerText =
                requestMarkAsSolvedButton.getAttribute(
                  "data-solve-and-submit-translation"
                );
            }
          }
        });
      }
  
      const selects = document.querySelectorAll(
        "#request-status-select, #request-organization-select"
      );
  
      selects.forEach((element) => {
        element.addEventListener("change", (event) => {
          event.stopPropagation();
          saveFocus();
          element.form.submit();
        });
      });
  
      // Submit requests filter form on search in the request list page
      const quickSearch = document.querySelector("#quick-search");
      if (quickSearch) {
        quickSearch.addEventListener("keyup", (event) => {
          if (event.keyCode === ENTER) {
            event.stopPropagation();
            saveFocus();
            quickSearch.form.submit();
          }
        });
      }
  
      // Submit organization form in the request page
      const requestOrganisationSelect = document.querySelector(
        "#request-organization select"
      );
  
      if (requestOrganisationSelect) {
        requestOrganisationSelect.addEventListener("change", () => {
          requestOrganisationSelect.form.submit();
        });
  
        requestOrganisationSelect.addEventListener("click", (e) => {
          // Prevents Ticket details collapsible-sidebar to close on mobile
          e.stopPropagation();
        });
      }
  
      // If there are any error notifications below an input field, focus that field
      const notificationElm = document.querySelector(".notification-error");
      if (
        notificationElm &&
        notificationElm.previousElementSibling &&
        typeof notificationElm.previousElementSibling.focus === "function"
      ) {
        notificationElm.previousElementSibling.focus();
      }
    });
  
    // Dark Theme functionality
    function initDarkTheme() {
      addBackground();
      updateArticleFooter();
      fixNextPageButtons(); 
      // setupTutorialNavigation(); 
      updateSidebarActiveClass();
    }
  
    function addBackground() {
      const background = document.createElement('div');
      const blueGradient = document.createElement('div');
      const pinkGradient = document.createElement('div');
  
      background.className = 'background';
      blueGradient.className = 'blue';
      pinkGradient.className = 'pink';
  
      background.appendChild(blueGradient);
      background.appendChild(pinkGradient);
      document.body.prepend(background);
    }

    function updateArticleFooter() {
        const articleFoot = document.querySelector('.articleFoot')
        if (!articleFoot) return
    
        const feedbackDiv = document.createElement('div')
        feedbackDiv.innerText = 'Have feedback? '
        feedbackDiv.className = 'feedbackDiv'
    
        const feedbackLink = document.createElement('a')
        feedbackLink.className = 'feedbackLink'
        feedbackLink.innerText = 'Let us know!'
        feedbackLink.href = 'mailto:hello@superhuman.com?subject=Help%20Center%20Feedback'
    
        feedbackDiv.append(feedbackLink)
        articleFoot.prepend(feedbackDiv)

        // Add new code here - format the date in the time element
        const timeElement = articleFoot.querySelector('time.lu')
        if (timeElement) {
          const timestamp = timeElement.textContent.replace('Last updated on ', '')
          const date = new Date(timestamp)
          if (!isNaN(date)) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' }
            timeElement.textContent = 'Last updated on ' + date.toLocaleDateString('en-US', options)
          }
        }
        
        const articleRatings = document.querySelector('.articleRatings')
        if (articleRatings) {
          articleFoot.append(articleRatings)
        }
    }

    function fixNextPageButtons() {
        // Find all nextPageButton divs
        const nextPageButtons = document.querySelectorAll('.nextPageButton');
        
        nextPageButtons.forEach(button => {
          // Get the current HTML and text content
          const currentHTML = button.innerHTML;
          const textContent = button.textContent.trim();
          
          // Check for several possible patterns
          if (
            // Case 1: Contains &nbsp; and "Up Next" (your original check)
            (currentHTML.includes('&nbsp;') && currentHTML.includes('Up Next')) ||
            // Case 2: Contains "Up Next" without proper paragraph structure
            (textContent.startsWith('Up Next') && !currentHTML.includes('<p>Up Next</p>')) ||
            // Case 3: Has "Up Next" text directly adjacent to the link
            /Up Next\s*<a/.test(currentHTML)
          ) {
            // Extract the link or links
            const linkMatches = currentHTML.match(/<a[^>]*>([^<]*)<\/a>/g);
            const links = linkMatches ? linkMatches.join('') : '';
            
            // Create the correct structure with just one "Up Next" followed by the links
            button.innerHTML = `<p>Up Next</p>${links}`;
          }
        });
      }

      function updateSidebarActiveClass() {
        // Get article element with data attributes
        const articleEl = document.getElementById('fullArticle');
        
        if (!articleEl) {
          console.log('Article element not found, using fallback method');
          fallbackUrlMatching();
          return;
        }
        
        // Get data from the article element
        const articleId = articleEl.getAttribute('data-article-id');
        const sectionId = articleEl.getAttribute('data-section-id');
        const sectionName = articleEl.getAttribute('data-section-name');
        
        // Log the data we have from Handlebars
        console.log('Article data from Handlebars:', {
          articleId: articleId,
          sectionId: sectionId,
          sectionName: sectionName
        });
        
        // Use sectionId to fetch the category information
        if (sectionId) {
          console.log('Attempting to find category from section ID:', sectionId);
          
          // First attempt: Look for section/category mapping directly in the page content
          findCategoryFromSectionContent(sectionId, sectionName);
        } else {
          console.log('Section ID not available, using fallback method');
          fallbackUrlMatching();
        }
      }
      
      function findCategoryFromSectionContent(sectionId, sectionName) {
        // These are the top-level sections we have direct links to in our sidebar
        const topLevelSections = [
          { name: "Get Started", article: "38448760193939" },
          { name: "Level Up", article: "38450004008595" },
          { name: "Supercharge Your Team", article: "38450322526995" }
        ];
        
        // Try to map section to a known category based on common patterns
        const sectionCategoryMap = {
          // Map section name patterns to their category
          "Account": "Account Setup",
          "Billing": "Billing",
          "Support": "Support",
          "Feature": "Features",
          "Integration": "Integrations",
          "Use Case": "Use Cases"
        };
        
        // First, check if this is a top-level section directly in our sidebar
        const isTopLevelSection = topLevelSections.some(section => {
          // Check if the section name matches
          if (sectionName && section.name === sectionName) {
            highlightMenuItemByText(section.name);
            console.log(`Found direct match for top-level section: ${section.name}`);
            return true;
          }
          return false;
        });
        
        if (isTopLevelSection) {
          return;
        }
        
        // Next, try to find a category match based on section name patterns
        if (sectionName) {
          for (const [pattern, category] of Object.entries(sectionCategoryMap)) {
            if (sectionName.includes(pattern)) {
              highlightMenuItemByText(category);
              console.log(`Found category match "${category}" based on section name containing "${pattern}"`);
              return;
            }
          }
        }
        
        // If we get here, we'll try to use the section ID to infer the category
        // This can be done by looking for clues in the URL structure
        const currentUrl = window.location.href;
        
        // Check for category ID in the URL
        const categoryMatch = currentUrl.match(/\/categories\/(\d+)/);
        if (categoryMatch && categoryMatch[1]) {
          highlightMenuItemByCategory(categoryMatch[1]);
          console.log(`Found category ID in URL: ${categoryMatch[1]}`);
          return;
        }
        
        // If no matches found so far, resort to extracting category from breadcrumbs or other page elements
        const breadcrumbs = document.querySelectorAll('.breadcrumbs a');
        if (breadcrumbs.length > 0) {
          // Typically the second breadcrumb item is the category
          if (breadcrumbs.length >= 2) {
            const categoryText = breadcrumbs[1].textContent.trim();
            highlightMenuItemByText(categoryText);
            console.log(`Found category from breadcrumbs: ${categoryText}`);
            return;
          }
        }
        
        // If we still don't have a match, use URL structure as last resort
        console.log('No category match found, using fallback URL matching');
        fallbackUrlMatching();
      }
      
      function highlightMenuItemByText(categoryText) {
        const navLinks = document.querySelectorAll('#sidebar .nav-list li a');
        let found = false;
        
        // First remove any existing active classes
        document.querySelectorAll('#sidebar .nav-list li').forEach(function(li) {
          li.classList.remove('active');
        });
        
        navLinks.forEach(function(link) {
          // Extract text without icon
          const linkText = link.textContent.trim().replace(/\s*\i.*$/, '');
          
          if (linkText.toLowerCase() === categoryText.toLowerCase()) {
            link.parentElement.classList.add('active');
            found = true;
            console.log(`Highlighted menu item: ${linkText}`);
          }
        });
        
        return found;
      }
      
      function highlightMenuItemByCategory(categoryId) {
        const navLinks = document.querySelectorAll('#sidebar .nav-list li a');
        let found = false;
        
        // First remove any existing active classes
        document.querySelectorAll('#sidebar .nav-list li').forEach(function(li) {
          li.classList.remove('active');
        });
        
        navLinks.forEach(function(link) {
          const linkUrl = link.getAttribute('href');
          
          if (linkUrl.includes(`/categories/${categoryId}`)) {
            link.parentElement.classList.add('active');
            found = true;
            console.log(`Highlighted menu item with category ID: ${categoryId}`);
          }
        });
        
        return found;
      }
      
      function fallbackUrlMatching() {
        console.log('Using fallback URL matching method');
        
        // Get current page URL
        const currentPageUrl = window.location.href;
        
        // Get all sidebar navigation links
        const navLinks = document.querySelectorAll('#sidebar .nav-list li a');
        
        // Remove any existing active classes
        document.querySelectorAll('#sidebar .nav-list li').forEach(function(li) {
          li.classList.remove('active');
        });
        
        // Define our mapping of URL patterns to sidebar items
        const urlPatterns = [
          { pattern: 'get-started', text: 'Get Started' },
          { pattern: 'level-up', text: 'Level Up' },
          { pattern: 'supercharge', text: 'Supercharge Your Team' },
          { pattern: 'account', text: 'Account Setup' },
          { pattern: 'billing', text: 'Billing' },
          { pattern: 'support', text: 'Support' },
          { pattern: 'features', text: 'Features' },
          { pattern: 'integrations', text: 'Integrations' },
          { pattern: 'use-cases', text: 'Use Cases' }
        ];
        
        // Try to match URL patterns first
        let patternMatch = false;
        
        urlPatterns.forEach(function(item) {
          if (currentPageUrl.toLowerCase().includes(item.pattern.toLowerCase())) {
            patternMatch = highlightMenuItemByText(item.text);
            if (patternMatch) {
              console.log(`Matched URL pattern "${item.pattern}" to menu item "${item.text}"`);
            }
          }
        });
        
        if (patternMatch) return;
        
        // Check for category in URL structure as a fallback
        const urlParts = currentPageUrl.split('/');
        let categoryMatch = false;
        
        // Try to find 'categories' segment in URL
        for (let i = 0; i < urlParts.length; i++) {
          if (urlParts[i] === 'categories' && i+1 < urlParts.length) {
            const categoryId = urlParts[i+1];
            categoryMatch = highlightMenuItemByCategory(categoryId);
            
            if (categoryMatch) {
              console.log(`Found category match from URL path: ${categoryId}`);
              return;
            }
          }
        }
        
        // Final fallback: check for exact URL matches
        let exactMatch = false;
        
        navLinks.forEach(function(link) {
          const linkUrl = link.getAttribute('href');
          
          if (currentPageUrl === linkUrl || currentPageUrl.endsWith(linkUrl)) {
            // Add active class to the parent li element for exact match
            link.parentElement.classList.add('active');
            exactMatch = true;
            console.log(`Found exact URL match: ${linkUrl}`);
          }
        });
        
        // If no exact match found, check for partial matches
        if (!exactMatch) {
          console.log('Trying partial URL matching');
          navLinks.forEach(function(link) {
            const linkUrl = link.getAttribute('href');
            
            // For article links in specific categories
            if (linkUrl.includes('/articles/') && currentPageUrl.includes('/articles/')) {
              const articleId = linkUrl.split('/articles/')[1];
              if (currentPageUrl.includes(articleId)) {
                link.parentElement.classList.add('active');
                console.log(`Found article ID match: ${articleId}`);
              }
            }
            // For more general URL matching (but avoid overly broad matches)
            else if (linkUrl.length > 10 && currentPageUrl.includes(linkUrl)) {
              link.parentElement.classList.add('active');
              console.log(`Found partial URL match: ${linkUrl}`);
            }
          });
        }
      }
      
  
  })();