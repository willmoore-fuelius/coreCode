// Site navigation - mobile menu toggle
// Toggles the .is-active state on the nav and toggle button, keeps aria-expanded
// in sync, closes on Escape, and resets when resizing up to the desktop layout.

(function() {
	'use strict';

	function init() {
		const toggles = document.querySelectorAll('.js-siteNavToggle');
		if (toggles.length === 0) return;

		toggles.forEach(function(toggle) {
			const navId = toggle.getAttribute('aria-controls');
			const nav = navId ? document.getElementById(navId) : null;
			if (!nav) return;

			function setOpen(open) {
				toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
				toggle.classList.toggle('is-active', open);
				nav.classList.toggle('is-active', open);
				document.body.classList.toggle('disable-scroll', open);
			}

			toggle.addEventListener('click', function() {
				const isOpen = toggle.getAttribute('aria-expanded') === 'true';
				setOpen(!isOpen);
			});

			document.addEventListener('keydown', function(e) {
				if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
					setOpen(false);
					toggle.focus();
				}
			});

			// The toggle is hidden at >= 1200px; make sure state does not persist
			// if the viewport grows while the menu is open.
			function handleResize() {
				if (window.innerWidth >= 1200) {
					setOpen(false);
				}
			}
			const debouncedResize = (window.CoreCode && window.CoreCode.debounce)
				? window.CoreCode.debounce(handleResize, 200)
				: handleResize;
			window.addEventListener('resize', debouncedResize);
		});
	}

	if (document.readyState !== 'loading') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
