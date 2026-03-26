(function () {
  'use strict';

  const containers = document.querySelectorAll('.js-accordion');

  /**
   * Collapse a panel with grid-row animation
   * @param {HTMLElement} trigger - The trigger button element
   * @param {HTMLElement} panel - The panel element to collapse
   * @returns {Promise} Resolves when transition completes
   */
  function collapsePanel(trigger, panel) {
    return new Promise(function (resolve) {
      trigger.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        resolve();
        return;
      }

      let safetyTimeout;

      const handleTransitionEnd = function (e) {
        if (e.propertyName === 'grid-template-rows') {
          panel.removeEventListener('transitionend', handleTransitionEnd);
          clearTimeout(safetyTimeout);
          resolve();
        }
      };

      panel.addEventListener('transitionend', handleTransitionEnd);

      safetyTimeout = setTimeout(function () {
        panel.removeEventListener('transitionend', handleTransitionEnd);
        resolve();
      }, 400);
    });
  }

  /**
   * Expand a panel with grid-row animation
   * @param {HTMLElement} trigger - The trigger button element
   * @param {HTMLElement} panel - The panel element to expand
   */
  function expandPanel(trigger, panel) {
    trigger.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
  }

  /**
   * Get all open panels within a container
   * @param {HTMLElement} container - The accordion container
   * @param {HTMLElement} excludeTrigger - Trigger to exclude from results
   * @returns {Array} Array of {trigger, panel} objects
   */
  function getOpenPanels(container, excludeTrigger) {
    const openPanels = [];
    const triggers = container.querySelectorAll('.js-accordionTrigger');

    triggers.forEach(function (trigger) {
      if (trigger === excludeTrigger) return;
      if (trigger.getAttribute('aria-expanded') === 'true') {
        const panelId = trigger.getAttribute('aria-controls');
        const panel = container.querySelector('#' + panelId);
        if (panel) {
          openPanels.push({ trigger: trigger, panel: panel });
        }
      }
    });

    return openPanels;
  }

  /**
   * Handle click on accordion trigger
   * @param {Event} e - The click event
   * @param {HTMLElement} container - The accordion container
   */
  function handleTriggerClick(e, container) {
    const trigger = e.target.closest('.js-accordionTrigger');
    if (!trigger) return;

    const panelId = trigger.getAttribute('aria-controls');
    const panel = container.querySelector('#' + panelId);
    if (!panel) return;

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    const allowMultiple = container.getAttribute('data-allow-multiple') === 'true';

    if (isExpanded) {
      collapsePanel(trigger, panel);
    } else if (allowMultiple) {
      expandPanel(trigger, panel);
    } else {
      const openPanels = getOpenPanels(container, trigger);

      if (openPanels.length > 0) {
        Promise.all(
          openPanels.map(function (item) {
            return collapsePanel(item.trigger, item.panel);
          })
        ).then(function () {
          expandPanel(trigger, panel);
        });
      } else {
        expandPanel(trigger, panel);
      }
    }
  }

  /**
   * Handle keyboard navigation between accordion triggers
   * @param {KeyboardEvent} e - The keyboard event
   * @param {HTMLElement} container - The accordion container
   */
  function handleKeydown(e, container) {
    const trigger = e.target.closest('.js-accordionTrigger');
    if (!trigger) return;

    const triggers = Array.from(container.querySelectorAll('.js-accordionTrigger'));
    const index = triggers.indexOf(trigger);
    let nextIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (index + 1) % triggers.length;
        triggers[nextIndex].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (index - 1 + triggers.length) % triggers.length;
        triggers[nextIndex].focus();
        break;
      case 'Home':
        e.preventDefault();
        triggers[0].focus();
        break;
      case 'End':
        e.preventDefault();
        triggers[triggers.length - 1].focus();
        break;
    }
  }

  /**
   * Initialise a single accordion instance
   * @param {HTMLElement} container - The accordion container element
   */
  function initAccordion(container) {
    const triggers = container.querySelectorAll('.js-accordionTrigger');
    if (triggers.length === 0) return;

    container.addEventListener('click', function (e) {
      handleTriggerClick(e, container);
    });

    container.addEventListener('keydown', function (e) {
      handleKeydown(e, container);
    });
  }

  /**
   * Main initialisation
   */
  function init() {
    if (containers.length === 0) return;
    containers.forEach(initAccordion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
