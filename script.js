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
  
    // Cache for DOM selectors to avoid repeated queries
const selectorCache = {};
function getElements(selector) {
  if (!selectorCache[selector]) {
    selectorCache[selector] = document.querySelectorAll(selector);
  }
  return selectorCache[selector];
}

// Main initialization function
function initDarkTheme() {
  // Make this function a no-op if it's called again
  initDarkTheme = function() {};
  
  // Show background immediately
  addBackground();
  
  // Split tasks into critical and non-critical
  const criticalTasks = () => {
    // Prioritize sidebar navigation as it affects user experience immediately
    const articleEl = document.getElementById('fullArticle');
    
    if (articleEl) {
      // We're on an article page - use article data to highlight sidebar
      updateSidebarFromArticle(articleEl);
    } else {
      // We're on a category page or another type of page
      updateSidebarFromCategoryPage();
    }
  };

  const nonCriticalTasks = () => {
    // Less critical UI updates
    updateArticleFooter();
    fixNextPageButtons();
  };

  // Execute critical tasks immediately
  requestAnimationFrame(criticalTasks);

  // Defer non-critical tasks
  if ('requestIdleCallback' in window) {
    requestIdleCallback(nonCriticalTasks, { timeout: 500 });
  } else {
    setTimeout(nonCriticalTasks, 50);
  }
}

// Reveal the background that's already in the HTML
function addBackground() {
  const background = document.querySelector('.background');
  if (background) {
    // Force a reflow before adding the class to ensure smooth transition
    background.getBoundingClientRect();
    background.classList.add('visible');
  }
}

// Optimized article footer update
function updateArticleFooter() {
  const articleFoot = document.querySelector('.articleFoot');
  if (!articleFoot || articleFoot.querySelector('.feedbackDiv')) {
    // Exit early if no footer or already processed
    return;
  }
  
  // Create elements once and append in a single operation
  const fragment = document.createDocumentFragment();
  
  const feedbackDiv = document.createElement('div');
  feedbackDiv.innerText = 'Have feedback? ';
  feedbackDiv.className = 'feedbackDiv';
  
  const feedbackLink = document.createElement('a');
  feedbackLink.className = 'feedbackLink';
  feedbackLink.innerText = 'Let us know!';
  feedbackLink.href = 'mailto:hello@superhuman.com?subject=Help%20Center%20Feedback';
  
  feedbackDiv.appendChild(feedbackLink);
  fragment.appendChild(feedbackDiv);
  
  // Format date in the time element
  const timeElement = articleFoot.querySelector('time.lu');
  if (timeElement) {
    const timestamp = timeElement.textContent.replace('Last updated on ', '');
    const date = new Date(timestamp);
    if (!isNaN(date)) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      timeElement.textContent = 'Last updated on ' + date.toLocaleDateString('en-US', options);
    }
  }
  
  // Add to DOM in a single operation
  articleFoot.insertBefore(fragment, articleFoot.firstChild);
  
  // Move article ratings to the end if they exist
  const articleRatings = document.querySelector('.articleRatings');
  if (articleRatings && articleRatings.parentNode !== articleFoot) {
    articleFoot.appendChild(articleRatings);
  }
}

// Optimize next page button fix with batched processing
function fixNextPageButtons() {
  // Use more specific selector to reduce search space
  const nextPageButtons = document.querySelectorAll('.nextPageButton');
  if (!nextPageButtons.length) return;
  
  // Process in batches for better performance
  const batchSize = 5;
  let index = 0;
  
  function processBatch() {
    const endIndex = Math.min(index + batchSize, nextPageButtons.length);
    
    for (let i = index; i < endIndex; i++) {
      const button = nextPageButtons[i];
      // Skip if already processed
      if (button.dataset.processed) continue;
      
      const currentHTML = button.innerHTML;
      const textContent = button.textContent.trim();
      
      if (
        (currentHTML.includes('&nbsp;') && currentHTML.includes('Up Next')) ||
        (textContent.startsWith('Up Next') && !currentHTML.includes('<p>Up Next</p>')) ||
        /Up Next\s*<a/.test(currentHTML)
      ) {
        const linkMatches = currentHTML.match(/<a[^>]*>([^<]*)<\/a>/g);
        const links = linkMatches ? linkMatches.join('') : '';
        
        button.innerHTML = `<p>Up Next</p>${links}`;
      }
      
      // Mark as processed
      button.dataset.processed = 'true';
    }
    
    index = endIndex;
    
    // Continue processing if there are more items
    if (index < nextPageButtons.length) {
      requestAnimationFrame(processBatch);
    }
  }
  
  // Start processing
  requestAnimationFrame(processBatch);
}

// Extract clean text from a link, removing any icon text
function getCleanLinkText(link) {
  // Try to get direct text nodes first
  let linkText = "";
  let node = link.firstChild;
  
  while (node) {
    if (node.nodeType === 3) { // Text node
      linkText += node.nodeType === 3 ? node.textContent.trim() : '';
    }
    node = node.nextSibling;
  }
  
  // Fallback to full text and strip icon if needed
  if (!linkText) {
    linkText = link.textContent.trim();
    // Remove icon text if present
    const iconIndex = linkText.indexOf('icon-');
    if (iconIndex !== -1) {
      linkText = linkText.substring(0, iconIndex).trim();
    }
  }
  
  return linkText;
}

// Build menu map efficiently for faster lookups
function buildMenuMap(links) {
  const map = {};
  
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const text = getCleanLinkText(link);
    map[text.toLowerCase()] = link;
  }
  
  return map;
}

// Efficiently highlight menu item by text
function highlightMenuItem(items, menuMap, targetText) {
  if (!targetText) return false;
  
  // Case-insensitive lookup
  const targetKey = targetText.toLowerCase();
  const matchedLink = menuMap[targetKey];
  
  if (matchedLink) {
    // First check if already active to avoid unnecessary DOM updates
    const parent = matchedLink.parentElement;
    if (parent.classList.contains('active')) {
      return true;
    }
    
    // Remove active class from all items
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('active');
    }
    
    // Add active to the matched element
    parent.classList.add('active');
    return true;
  }
  
  return false;
}

// Optimized sidebar update for article pages
function updateSidebarFromArticle(articleEl) {
  // If articleEl is not provided, use cached or get it
  articleEl = articleEl || document.getElementById('fullArticle');
  
  // Exit early if article element doesn't exist
  if (!articleEl) return;
  
  // Get section data
  const sectionId = articleEl.getAttribute('data-section-id');
  const sectionName = articleEl.getAttribute('data-section-name');
  
  // Get sidebar items once
  const sidebarItems = getElements('#sidebar .nav-list li');
  const sidebarLinks = getElements('#sidebar .nav-list li a');
  
  // Exit early if no sidebar
  if (!sidebarItems.length) return;
  
  // Create category map for direct matching
  const categoryMap = {
    "Billing": "Billing",
    "Account": "Account Setup",
    "Support": "Support",
    "Features": "Features",
    "Feature": "Features",
    "Integrations": "Integrations",
    "Integration": "Integrations",
    "Use Cases": "Use Cases",
    "Use Case": "Use Cases",
    "Get Started": "Get Started",
    "Level Up": "Level Up",
    "Supercharge Your Team": "Supercharge Your Team"
  };
  
  // Build menu map once
  const menuMap = buildMenuMap(sidebarLinks);
  
  // Try section name matching if available
  if (sectionName) {
    // 1. Try exact match first
    if (categoryMap[sectionName] && highlightMenuItem(sidebarItems, menuMap, categoryMap[sectionName])) {
      return;
    }
    
    // 2. Try partial match
    for (const [pattern, category] of Object.entries(categoryMap)) {
      if (sectionName.includes(pattern) && highlightMenuItem(sidebarItems, menuMap, category)) {
        return;
      }
    }
    
    // 3. Case-insensitive keyword check
    const lowerSectionName = sectionName.toLowerCase();
    for (const keyword of ["billing", "account", "support", "feature", "integration", "use case"]) {
      if (lowerSectionName.includes(keyword)) {
        const mappedCategory = categoryMap[keyword.charAt(0).toUpperCase() + keyword.slice(1)];
        if (mappedCategory && highlightMenuItem(sidebarItems, menuMap, mappedCategory)) {
          return;
        }
      }
    }
  }
  
  // If no match found by content, try URL-based matching
  urlBasedMatching(sidebarItems, sidebarLinks);
}

// Optimized sidebar update for category pages
function updateSidebarFromCategoryPage() {
  // Get sidebar elements once
  const sidebarItems = getElements('#sidebar .nav-list li');
  const sidebarLinks = getElements('#sidebar .nav-list li a');
  
  // Exit early if no sidebar
  if (!sidebarItems.length) return;
  
  // Method 1: Use URL for category ID (highest specificity)
  const currentUrl = window.location.href;
  const categoryIdMatch = currentUrl.match(/\/categories\/(\d+)/);
  
  if (categoryIdMatch && categoryIdMatch[1]) {
    const categoryId = categoryIdMatch[1];
    const idSelector = `/categories/${categoryId}`;
    
    // Check links for matching category ID
    for (let i = 0; i < sidebarLinks.length; i++) {
      const link = sidebarLinks[i];
      const href = link.getAttribute('href');
      if (href && href.includes(idSelector)) {
        // Clear any existing active classes
        sidebarItems.forEach(item => item.classList.remove('active'));
        link.parentElement.classList.add('active');
        return;
      }
    }
  }
  
  // Method 2: Use page heading
  const pageHeading = document.querySelector('h1, .page-header h1');
  if (pageHeading) {
    const headingText = pageHeading.textContent.trim();
    const menuMap = buildMenuMap(sidebarLinks);
    
    // Try exact match with heading text
    if (highlightMenuItem(sidebarItems, menuMap, headingText)) {
      return;
    }
    
    // Try known categories
    const knownCategories = [
      "Integrations", "Account Setup", "Billing", 
      "Support", "Features", "Use Cases"
    ];
    
    for (let i = 0; i < knownCategories.length; i++) {
      const category = knownCategories[i];
      if (headingText.includes(category) && highlightMenuItem(sidebarItems, menuMap, category)) {
        return;
      }
    }
  }
  
  // Method 3: URL-based matching as fallback
  urlBasedMatching(sidebarItems, sidebarLinks);
}

// Optimized URL-based matching with faster pattern matching
function urlBasedMatching(sidebarItems, sidebarLinks) {
  const currentUrl = window.location.href.toLowerCase();
  
  // Fast pattern matching
  const urlPatterns = [
    ['billing', 'Billing'],
    ['account', 'Account Setup'],
    ['support', 'Support'],
    ['feature', 'Features'],
    ['integration', 'Integrations'],
    ['use-case', 'Use Cases'],
    ['get-started', 'Get Started'],
    ['level-up', 'Level Up'],
    ['supercharge', 'Supercharge Your Team']
  ];
  
  // Clear active state once
  let needsClearActive = true;
  
  // Check for category ID in URL first (most specific)
  const categoryMatch = currentUrl.match(/\/categories\/(\d+)/);
  if (categoryMatch && categoryMatch[1]) {
    const categoryId = `/categories/${categoryMatch[1]}`;
    
    for (let i = 0; i < sidebarLinks.length; i++) {
      const link = sidebarLinks[i];
      const href = (link.getAttribute('href') || '').toLowerCase();
      
      if (href.includes(categoryId)) {
        if (needsClearActive) {
          for (let j = 0; j < sidebarItems.length; j++) {
            sidebarItems[j].classList.remove('active');
          }
          needsClearActive = false;
        }
        link.parentElement.classList.add('active');
        return;
      }
    }
  }
  
  // Try URL pattern matching
  for (let i = 0; i < urlPatterns.length; i++) {
    const [pattern, menuText] = urlPatterns[i];
    
    if (currentUrl.includes(pattern)) {
      // Search for matching menu item
      for (let j = 0; j < sidebarLinks.length; j++) {
        const link = sidebarLinks[j];
        const linkText = getCleanLinkText(link);
        
        if (linkText.toLowerCase() === menuText.toLowerCase()) {
          if (needsClearActive) {
            for (let k = 0; k < sidebarItems.length; k++) {
              sidebarItems[k].classList.remove('active');
            }
            needsClearActive = false;
          }
          link.parentElement.classList.add('active');
          return;
        }
      }
    }
  }
  
  // Last resort: Check for partial URL matches
  // Create a match quality map to find the best match
  let bestMatch = { link: null, quality: 0 };
  
  for (let i = 0; i < sidebarLinks.length; i++) {
    const link = sidebarLinks[i];
    const href = (link.getAttribute('href') || '').toLowerCase();
    let matchQuality = 0;
    
    // Exact match (highest priority)
    if (currentUrl === href || currentUrl.endsWith(href)) {
      matchQuality = 100;
    } 
    // Article ID match
    else if (href.includes('/articles/') && currentUrl.includes('/articles/')) {
      const articleId = href.split('/articles/')[1];
      if (currentUrl.includes(articleId)) {
        matchQuality = 90;
      }
    }
    // Significant partial match
    else if (href.length > 10 && currentUrl.includes(href)) {
      matchQuality = 80 + (href.length / currentUrl.length) * 10;
    }
    
    if (matchQuality > bestMatch.quality) {
      bestMatch = { link, quality: matchQuality };
    }
  }
  
  // Apply the best match if found
  if (bestMatch.link && bestMatch.quality > 0) {
    if (needsClearActive) {
      for (let i = 0; i < sidebarItems.length; i++) {
        sidebarItems[i].classList.remove('active');
      }
    }
    bestMatch.link.parentElement.classList.add('active');
  }
}

function enhanceSearchButton() {
    // Find the submit button
    const searchButton = document.querySelector('form.search.search-full input[type="submit"], form.search.search-full input[name="commit"]');
    
    if (searchButton && !searchButton.parentElement.classList.contains('search-button-wrapper')) {
      // Create wrapper element
      const wrapper = document.createElement('div');
      wrapper.className = 'search-button-wrapper';
      
      // Insert wrapper before button in the DOM
      searchButton.parentNode.insertBefore(wrapper, searchButton);
      
      // Move button into wrapper
      wrapper.appendChild(searchButton);
    }
  }

  function enhanceSidebarSearch() {
    // Target the Zendesk search component in the sidebar
    const searchForm = document.querySelector('#sidebar form.sidebar-search');
    
    if (searchForm) {
      // Basic classes should already be applied by inline script
      // but we add them again in case that failed
      searchForm.id = 'searchBar';
      searchForm.classList.add('sm');
      
      // Remove ALL original buttons and controls
      const buttonsToRemove = searchForm.querySelectorAll('button, input[type="submit"], .search-button, .search-button-wrapper, .search-controls, .search-submit-wrapper');
      buttonsToRemove.forEach(button => button.remove());
      
      // Handle the search input
      const searchInput = searchForm.querySelector('input[type="search"]');
      if (searchInput) {
        searchInput.classList.add('search-query');
        searchInput.placeholder = 'Search';
        searchInput.setAttribute('aria-label', 'Search');
      }
      
      // Create new spyglass button
      const newButton = document.createElement('button');
      newButton.type = 'submit';
      
      // Add screen reader text
      const srOnly = document.createElement('span');
      srOnly.className = 'sr-only';
      srOnly.textContent = 'Toggle Search';
      newButton.appendChild(srOnly);
      
      // Add search icon
      const icon = document.createElement('i');
      icon.className = 'icon-search';
      newButton.appendChild(icon);
      
      // Append the new button
      searchForm.appendChild(newButton);
      
      // Add the dropdown container
      if (!searchForm.querySelector('#serp-dd')) {
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'serp-dd';
        resultsContainer.className = 'sb';
        resultsContainer.style.display = 'none';
        
        const resultsList = document.createElement('ul');
        resultsList.className = 'result';
        
        resultsContainer.appendChild(resultsList);
        searchForm.appendChild(resultsContainer);
      }
      
      // Remove any extra Zendesk elements
      const extraElements = searchForm.querySelectorAll('.search-results-column, .search-box-separator');
      extraElements.forEach(el => el.remove());
      
      // Now that everything is set up, make the search visible
      searchForm.style.opacity = '1';
    }
    
  }
  
  // Update the initDarkTheme function to include button enhancement
  function initDarkTheme() {
    // Make this function a no-op if it's called again
    initDarkTheme = function() {};
    
    // Show background immediately
    addBackground();
    
    // Split tasks into critical and non-critical
    const criticalTasks = () => {
      // Prioritize sidebar navigation as it affects user experience immediately
      const articleEl = document.getElementById('fullArticle');
      
      if (articleEl) {
        // We're on an article page - use article data to highlight sidebar
        updateSidebarFromArticle(articleEl);
      } else {
        // We're on a category page or another type of page
        updateSidebarFromCategoryPage();
      }
      
      // Apply button styling right away (it's lightweight CSS-only)
      enhanceSearchButton();
      enhanceSidebarSearch();
    };
  
    const nonCriticalTasks = () => {
      // Less critical UI updates
      updateArticleFooter();
      fixNextPageButtons();
    };
  
    // Execute critical tasks immediately
    requestAnimationFrame(criticalTasks);
  
    // Defer non-critical tasks
    if ('requestIdleCallback' in window) {
      requestIdleCallback(nonCriticalTasks, { timeout: 500 });
    } else {
      setTimeout(nonCriticalTasks, 50);
    }
  }

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dark theme when DOM is ready
  initDarkTheme();
});
  
  })();