// Statistics module - animated counters via Odometer
// Uses IntersectionObserver so counters animate when scrolled into view

(function() {
	'use strict';

	const countElementSelector = '.js-count';
	const statisticsInitialisedClass = 'is-statisticsInitialised';

	function init() {
		const statisticModules = document.querySelectorAll('.js-statistics');
		if (statisticModules.length === 0) return;

		if (typeof Odometer === 'undefined') {
			console.warn('Odometer is not loaded — statistics counters cannot animate. Ensure odometer.js is required on this template.');
			return;
		}

		function animateCounter(counters, format, duration) {
			counters.forEach(function(el) {
				const rawValue = el.getAttribute('data-value');
				if (rawValue === null || rawValue === '') return;

				const value = parseFloat(rawValue);
				if (isNaN(value)) return;

				const od = new Odometer({
					el: el,
					value: 0,
					format: format,
					duration: duration
				});

				od.update(value);
			});
		}

		function animateStatistics(statisticModule) {
			if (statisticModule.classList.contains(statisticsInitialisedClass)) {
				return;
			}

			const duration = parseInt(statisticModule.getAttribute('data-statistics-duration'), 10) || 2000;
			const format = statisticModule.getAttribute('data-statistics-format') || '(,ddd)';
			const counters = Array.from(statisticModule.querySelectorAll(countElementSelector));

			statisticModule.classList.add(statisticsInitialisedClass);
			animateCounter(counters, format, duration);
		}

		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver(function(entries) {
				entries.forEach(function(entry) {
					if (entry.isIntersecting) {
						animateStatistics(entry.target);
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: 0.25 });

			statisticModules.forEach(function(module) {
				observer.observe(module);
			});
		} else {
			// Fallback: animate immediately
			statisticModules.forEach(function(module) {
				animateStatistics(module);
			});
		}
	}

	if (document.readyState !== 'loading') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
