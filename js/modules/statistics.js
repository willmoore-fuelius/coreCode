document.addEventListener('DOMContentLoaded', function() {
	const countElementSelector = '.js-count';
	const statisticModules = document.querySelectorAll('.js-statistics');
	const statisticsInitialisedClass = 'statistics-initialised';

	function animateCounter(counters, format, duration) {
		counters.forEach(function(el) {
			const value = el.getAttribute('data-value');

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

		const duration = statisticModule.getAttribute('data-statistics-duration') || 2000;
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
});
