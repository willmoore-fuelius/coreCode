// Shared utility functions for Core Code modules
// Loaded globally via base.html — available to all modules

(function() {
	'use strict';

	const focusableSelectors = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

	/**
	 * Return the visible, focusable descendants of a container.
	 * Excludes disabled and visually hidden elements so the trap
	 * boundaries land on elements that can actually receive focus.
	 *
	 * @param {HTMLElement} container
	 * @returns {HTMLElement[]}
	 */
	function getFocusable(container) {
		return Array.prototype.filter.call(
			container.querySelectorAll(focusableSelectors),
			function(el) {
				return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
			}
		);
	}

	/**
	 * Trap keyboard focus within a container element.
	 * Returns a cleanup function to remove the event listener.
	 *
	 * Only needed for non-dialog overlays. A native <dialog> opened with
	 * showModal() already contains focus and should not use this.
	 *
	 * @param {HTMLElement} container - The element to trap focus within
	 * @returns {Function} removeTrap - Call to remove the keydown listener
	 */
	function trapFocus(container) {
		function handleKeydown(e) {
			if (e.key !== 'Tab') return;

			const focusableElements = getFocusable(container);
			if (focusableElements.length === 0) return;

			const firstFocusable = focusableElements[0];
			const lastFocusable = focusableElements[focusableElements.length - 1];

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

		const firstFocusable = getFocusable(container)[0];
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
		let timeout;
		return function() {
			const context = this;
			const args = arguments;
			const later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait || 200);
			if (callNow) func.apply(context, args);
		};
	}

	// Expose on global namespace
	window.CoreCode = window.CoreCode || {};
	window.CoreCode.trapFocus = trapFocus;
	window.CoreCode.getFocusable = getFocusable;
	window.CoreCode.debounce = debounce;
})();
