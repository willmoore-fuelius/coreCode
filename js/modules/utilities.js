// Shared utility functions for Core Code modules
// Loaded globally via base.html — available to all modules

(function() {
	'use strict';

	/**
	 * Trap keyboard focus within a container element.
	 * Returns a cleanup function to remove the event listener.
	 *
	 * @param {HTMLElement} container - The element to trap focus within
	 * @returns {Function} removeTrap - Call to remove the keydown listener
	 */
	function trapFocus(container) {
		var focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

		function handleKeydown(e) {
			if (e.key !== 'Tab') return;

			var focusableElements = container.querySelectorAll(focusableSelectors);
			if (focusableElements.length === 0) return;

			var firstFocusable = focusableElements[0];
			var lastFocusable = focusableElements[focusableElements.length - 1];

			if (e.shiftKey) {
				if (document.activeElement === firstFocusable) {
					e.preventDefault();
					lastFocusable.focus();
				}
			} else {
				if (document.activeElement === lastFocusable) {
					e.preventDefault();
					firstFocusable.focus();
				}
			}
		}

		container.addEventListener('keydown', handleKeydown);

		var firstFocusable = container.querySelectorAll(focusableSelectors)[0];
		if (firstFocusable) {
			firstFocusable.focus();
		}

		return function removeTrap() {
			container.removeEventListener('keydown', handleKeydown);
		};
	}

	/**
	 * Debounce a function call.
	 *
	 * @param {Function} func - The function to debounce
	 * @param {number} wait - Delay in milliseconds (default 200)
	 * @param {boolean} immediate - Fire on leading edge instead of trailing
	 * @returns {Function} debounced function
	 */
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this;
			var args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait || 200);
			if (callNow) func.apply(context, args);
		};
	}

	// Expose on global namespace
	window.CoreCode = window.CoreCode || {};
	window.CoreCode.trapFocus = trapFocus;
	window.CoreCode.debounce = debounce;
})();
