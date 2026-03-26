// Rotators module - Splide-based carousel initialization
// Uses IntersectionObserver for lazy initialization to reduce main thread load

document.addEventListener('DOMContentLoaded', function() {
	const rotators = document.querySelectorAll('.js-rotator:not(.splide--initialized)');

	if (rotators.length === 0) return;

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
			gap: customSettings.gap || 0,
			breakpoints: breakpoints
		};

		// Merge settings
		const options = Object.assign({}, defaults, customSettings);

		// Handle autoplay speed (convert seconds to milliseconds if needed)
		if (options.autoplaySpeed) {
			options.interval = options.autoplaySpeed * 1000;
			delete options.autoplaySpeed;
		}

		// Initialize Splide
		const splide = new Splide(element, options);

		// Custom arrow controls
		const nextButton = document.querySelector('#' + uniqueId + ' .js-rotator__next');
		const prevButton = document.querySelector('#' + uniqueId + ' .js-rotator__prev');

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

		// Update slide index display on change
		const indexDisplay = document.querySelector('#' + uniqueId + '__controls .js-rotator__index');
		if (indexDisplay) {
			splide.on('move', function(newIndex) {
				indexDisplay.textContent = newIndex + 1;
			});
		}

		splide.mount();
		element.classList.add('splide--initialized');
	}

	if ('IntersectionObserver' in window) {
		const observer = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					initRotator(entry.target);
					observer.unobserve(entry.target);
				}
			});
		}, { rootMargin: '200px' });

		rotators.forEach(function(element) {
			observer.observe(element);
		});
	} else {
		// Fallback: initialize immediately
		rotators.forEach(function(element) {
			initRotator(element);
		});
	}
});
