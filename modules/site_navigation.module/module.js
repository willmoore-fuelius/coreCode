(function() {
  'use strict';

  // Constants
  var SELECTORS = {
    container: '.js-siteNav',
    mobileToggle: '.js-siteNav-mobileToggle',
    panel: '.js-siteNav-panel',
    menubar: '.js-siteNav-menubar',
    trigger: '.js-siteNav-trigger',
    dropdown: '.js-siteNav-dropdown',
    dropdownLink: '.js-siteNav-dropdownLink',
    link: '.js-siteNav-link'
  };

  var CLASSES = {
    active: 'is-active',
    initialized: 'is-initialized'
  };

  // Module state
  var focusTrapCleanup = null;
  var previousFocus = null;

  // Functions

  /**
   * Close a specific dropdown
   * @param {Element} trigger - The dropdown trigger button
   * @param {Element} dropdown - The dropdown panel
   */
  function closeDropdown(trigger, dropdown) {
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove(CLASSES.active);
    dropdown.setAttribute('aria-hidden', 'true');
  }

  /**
   * Open a specific dropdown
   * @param {Element} trigger - The dropdown trigger button
   * @param {Element} dropdown - The dropdown panel
   */
  function openDropdown(trigger, dropdown) {
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.classList.add(CLASSES.active);
    dropdown.removeAttribute('aria-hidden');
  }

  /**
   * Close all dropdowns within the container
   * @param {Element} container - The nav container
   */
  function closeAllDropdowns(container) {
    var triggers = container.querySelectorAll(SELECTORS.trigger);
    triggers.forEach(function(trigger) {
      var panelId = trigger.getAttribute('aria-controls');
      var dropdown = panelId ? document.getElementById(panelId) : null;
      if (dropdown) {
        closeDropdown(trigger, dropdown);
      }
    });
  }

  /**
   * Open the mobile panel
   * @param {Element} container - The nav container
   * @param {Element} toggle - The mobile toggle button
   * @param {Element} panel - The mobile panel
   */
  function openMobilePanel(container, toggle, panel) {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    panel.classList.add(CLASSES.active);
    document.body.style.overflow = 'hidden';

    // Focus trap
    if (window.CoreCode && window.CoreCode.trapFocus) {
      focusTrapCleanup = window.CoreCode.trapFocus(panel);
    }
  }

  /**
   * Close the mobile panel
   * @param {Element} container - The nav container
   * @param {Element} toggle - The mobile toggle button
   * @param {Element} panel - The mobile panel
   */
  function closeMobilePanel(container, toggle, panel) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    panel.classList.remove(CLASSES.active);
    document.body.style.overflow = '';

    // Clean up focus trap
    if (focusTrapCleanup) {
      focusTrapCleanup();
      focusTrapCleanup = null;
    }

    // Close all dropdowns within
    closeAllDropdowns(container);

    // Restore focus to toggle
    toggle.focus();
  }

  /**
   * Check if mobile layout is active
   * @returns {boolean}
   */
  function isMobileLayout() {
    return window.matchMedia('(width < 992px)').matches;
  }

  /**
   * Handle click on mobile toggle
   * @param {Element} container - The nav container
   * @param {Element} toggle - The mobile toggle button
   * @param {Element} panel - The mobile panel
   */
  function handleMobileToggle(container, toggle, panel) {
    var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobilePanel(container, toggle, panel);
    } else {
      openMobilePanel(container, toggle, panel);
    }
  }

  /**
   * Handle click on dropdown trigger
   * @param {Element} container - The nav container
   * @param {Element} trigger - The dropdown trigger button
   */
  function handleDropdownToggle(container, trigger) {
    var panelId = trigger.getAttribute('aria-controls');
    var dropdown = panelId ? document.getElementById(panelId) : null;
    if (!dropdown) return;

    var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    // Close other dropdowns first (desktop only)
    if (!isMobileLayout()) {
      var allTriggers = container.querySelectorAll(SELECTORS.trigger);
      allTriggers.forEach(function(otherTrigger) {
        if (otherTrigger !== trigger) {
          var otherId = otherTrigger.getAttribute('aria-controls');
          var otherDropdown = otherId ? document.getElementById(otherId) : null;
          if (otherDropdown) {
            closeDropdown(otherTrigger, otherDropdown);
          }
        }
      });
    }

    if (isExpanded) {
      closeDropdown(trigger, dropdown);
    } else {
      openDropdown(trigger, dropdown);
      // Focus first link in dropdown
      var firstLink = dropdown.querySelector(SELECTORS.dropdownLink);
      if (firstLink) {
        firstLink.focus();
      }
    }
  }

  /**
   * Handle keyboard navigation within dropdown
   * @param {Event} e - Keydown event
   * @param {Element} container - The nav container
   */
  function handleDropdownKeydown(e, container) {
    var target = e.target;
    var dropdown = target.closest(SELECTORS.dropdown);
    if (!dropdown) return;

    var links = Array.from(dropdown.querySelectorAll(SELECTORS.dropdownLink));
    var currentIndex = links.indexOf(target);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < links.length - 1) {
          links[currentIndex + 1].focus();
        } else {
          links[0].focus();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          links[currentIndex - 1].focus();
        } else {
          links[links.length - 1].focus();
        }
        break;

      case 'Home':
        e.preventDefault();
        links[0].focus();
        break;

      case 'End':
        e.preventDefault();
        links[links.length - 1].focus();
        break;

      case 'Escape':
        e.preventDefault();
        // Find the trigger that controls this dropdown
        var triggerId = dropdown.getAttribute('id');
        var trigger = container.querySelector('[aria-controls="' + triggerId + '"]');
        if (trigger) {
          closeDropdown(trigger, dropdown);
          trigger.focus();
        }
        break;
    }
  }

  /**
   * Handle keyboard navigation on top-level menubar items
   * @param {Event} e - Keydown event
   * @param {Element} container - The nav container
   */
  function handleMenubarKeydown(e, container) {
    var target = e.target;

    // Only handle top-level links and triggers
    if (!target.closest('.m-siteNav__item') || target.closest(SELECTORS.dropdown)) return;

    var menubar = container.querySelector(SELECTORS.menubar);
    if (!menubar) return;

    var items = Array.from(menubar.children);
    var currentItem = target.closest('.m-siteNav__item');
    var currentIndex = items.indexOf(currentItem);

    if (currentIndex === -1) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusTopLevelItem(items, currentIndex + 1 >= items.length ? 0 : currentIndex + 1);
        break;

      case 'ArrowLeft':
        e.preventDefault();
        focusTopLevelItem(items, currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1);
        break;

      case 'ArrowDown':
        // If this is a trigger with a dropdown, open it
        var trigger = target.closest(SELECTORS.trigger);
        if (trigger) {
          e.preventDefault();
          handleDropdownToggle(container, trigger);
        }
        break;

      case 'Enter':
      case ' ':
        // If this is a trigger, toggle dropdown
        if (target.matches(SELECTORS.trigger)) {
          e.preventDefault();
          handleDropdownToggle(container, target);
        }
        break;

      case 'Escape':
        // Close all dropdowns on desktop, close mobile panel on mobile
        e.preventDefault();
        closeAllDropdowns(container);
        break;
    }
  }

  /**
   * Focus the interactive element within a top-level menu item
   * @param {Array} items - Array of menu item li elements
   * @param {number} index - Index to focus
   */
  function focusTopLevelItem(items, index) {
    if (!items[index]) return;
    var focusable = items[index].querySelector(SELECTORS.trigger) || items[index].querySelector(SELECTORS.link);
    if (focusable) {
      focusable.focus();
    }
  }

  /**
   * Handle clicks outside the navigation to close dropdowns
   * @param {Event} e - Click event
   * @param {Element} container - The nav container
   * @param {Element} toggle - The mobile toggle button
   * @param {Element} panel - The mobile panel
   */
  function handleOutsideClick(e, container, toggle, panel) {
    if (container.contains(e.target)) return;

    // Close all dropdowns
    closeAllDropdowns(container);

    // Close mobile panel if open
    if (isMobileLayout() && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      closeMobilePanel(container, toggle, panel);
    }
  }

  /**
   * Handle Escape key at document level
   * @param {Event} e - Keydown event
   * @param {Element} container - The nav container
   * @param {Element} toggle - The mobile toggle button
   * @param {Element} panel - The mobile panel
   */
  function handleEscapeKey(e, container, toggle, panel) {
    if (e.key !== 'Escape') return;

    // Close mobile panel if open
    if (isMobileLayout() && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      e.preventDefault();
      closeMobilePanel(container, toggle, panel);
      return;
    }

    // Close any open dropdowns
    closeAllDropdowns(container);
  }

  /**
   * Initialize a single nav instance
   * @param {Element} container - The nav container element
   */
  function initModule(container) {
    var toggle = container.querySelector(SELECTORS.mobileToggle);
    var panel = container.querySelector(SELECTORS.panel);

    if (!toggle || !panel) {
      console.warn('SiteNav: required elements not found', container);
      return;
    }

    // Set initial closed state — source HTML has aria-expanded="true" for no-JS fallback
    toggle.setAttribute('aria-expanded', 'false');

    // Set dropdown triggers to collapsed state
    var triggers = container.querySelectorAll(SELECTORS.trigger);
    triggers.forEach(function(trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      var panelId = trigger.getAttribute('aria-controls');
      var dropdown = panelId ? document.getElementById(panelId) : null;
      if (dropdown) {
        dropdown.setAttribute('aria-hidden', 'true');
      }
    });

    // Mark as initialized — activates CSS hiding
    container.classList.add(CLASSES.initialized);

    // Mobile toggle click
    toggle.addEventListener('click', function() {
      handleMobileToggle(container, toggle, panel);
    });

    // Event delegation for dropdown triggers
    container.addEventListener('click', function(e) {
      var trigger = e.target.closest(SELECTORS.trigger);
      if (trigger) {
        e.preventDefault();
        handleDropdownToggle(container, trigger);
      }
    });

    // Keyboard navigation
    container.addEventListener('keydown', function(e) {
      // Check if inside a dropdown
      if (e.target.closest(SELECTORS.dropdown)) {
        handleDropdownKeydown(e, container);
      } else {
        handleMenubarKeydown(e, container);
      }
    });

    // Outside click
    document.addEventListener('click', function(e) {
      handleOutsideClick(e, container, toggle, panel);
    });

    // Escape key at document level
    document.addEventListener('keydown', function(e) {
      handleEscapeKey(e, container, toggle, panel);
    });
  }

  /**
   * Initialize all site nav instances
   */
  function init() {
    var containers = document.querySelectorAll(SELECTORS.container);
    if (containers.length === 0) return;
    containers.forEach(initModule);
  }

  // Initialise on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();