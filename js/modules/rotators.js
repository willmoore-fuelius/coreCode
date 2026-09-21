// Rotators module - Splide-based carousel initialization
// Uses IntersectionObserver for lazy initialization to reduce main thread load

(function() {
	'use strict';

	function init() {
		const rotators = document.querySelectorAll('.js-rotator:not(.splide--initialized)');

		if (rotators.length === 0) return;

		if (typeof Splide === 'undefined') {
			console.warn('Splide is not loaded — rotators cannot initialise. Ensure vendor.splide.js is required on this template.');
			return;
		}

		function initRotator(element) {
			if (element.classList.contains('splide--initialized')) return;

			const uniqueId = element.dataset.rotator;

			// Get custom settings from data attributes
			let customSettings = {};
			try {
				if (element.dataset.splideSettings) {
					customSettings = JSON.parse(element.dataset.splideSettings);
				}
			} catch (e) {
				console.warn('Invalid Splide settings JSON', e);
			}

			// Get responsive breakpoint settings
			const breakpoints = {};
			try {
				if (element.dataset.splideSmall) {
					breakpoints[552] = JSON.parse(element.dataset.splideSmall);
				}
				if (element.dataset.splideMedium) {
					breakpoints[992] = JSON.parse(element.dataset.splideMedium);
				}
			} catch (e) {
				console.warn('Invalid Splide breakpoint settings', e);
			}

			// Default settings
			const defaults = {
				type: 'slide',
				perPage: customSettings.perPage || 1,
				perMove: customSettings.perMove || 1,
				arrows: false,
				pagination: false,
				autoplay: false,
				gap: customSettings.gap || 0
			};

			// Merge settings
			const options = Object.assign({}, defaults, customSettings);

			// Deep-merge breakpoints so data-attribute breakpoints are not clobbered
			// by a breakpoints key inside data-splide-settings (Object.assign is shallow).
			options.breakpoints = Object.assign({}, breakpoints, customSettings.breakpoints || {});

			// Handle autoplay speed (convert seconds to milliseconds).
			// Setting a speed implies autoplay should be on — Splide ignores interval otherwise.
			if (options.autoplaySpeed) {
				options.interval = options.autoplaySpeed * 1000;
				options.autoplay = true;
				delete options.autoplaySpeed;
			}

			// Initialize Splide
			const splide = new Splide(element, options);

			// Custom arrow controls and index display are keyed by the element's id.
			// Guard on uniqueId and wrap the selector to avoid throwing on an invalid id.
			if (uniqueId) {
				let nextButton = null;
				let prevButton = null;
				let indexDisplay = null;
				try {
					nextButton = document.querySelector('#' + uniqueId + ' .js-rotator__next');
					prevButton = document.querySelector('#' + uniqueId + ' .js-rotator__prev');
					indexDisplay = document.querySelector('#' + uniqueId + '__controls .js-rotator__index');
				} catch (e) {
					console.warn('Invalid rotator id for control selectors:', uniqueId);
				}

				if (nextButton) {
					nextButton.addEventListener('click', function() {
						splide.go('>');
					});
				}

				if (prevButton) {
					prevButton.addEventListener('click', function() {
						splide.go('<');
					});
				}

				if (indexDisplay) {
					splide.on('move', function(newIndex) {
						indexDisplay.textContent = newIndex + 1;
					});
				}
			}

			splide.mount();
			element.classList.add('splide--initialized');
		}

		// Defer via the shared helper: a wrapper carrying data-lazy-init waits
		// until it nears the viewport, anything else initialises straight away.
		rotators.forEach(function(element) {
			if (window.CoreCode && window.CoreCode.lazyModuleInit && element.id) {
				window.CoreCode.lazyModuleInit(element.id, function() {
					initRotator(element);
				});
			} else {
				initRotator(element);
			}
		});
	}

	if (document.readyState !== 'loading') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
