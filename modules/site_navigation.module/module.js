// Site navigation
// Two independent behaviours: the mobile drawer toggle, and a disclosure
// button per top-level item that has children. Sub-menus open on click and
// close on Escape or an outside click, so they work on keyboard and touch —
// a hover-only reveal reaches neither.

(function() {
	'use strict';

	const DESKTOP_WIDTH = 1200;

	function closeAllSubmenus(scope) {
		scope.querySelectorAll('.js-submenuToggle[aria-expanded="true"]').forEach(function(toggle) {
			toggle.setAttribute('aria-expanded', 'false');
		});
	}

	function initSubmenus(nav) {
		nav.addEventListener('click', function(e) {
			const toggle = e.target.closest('.js-submenuToggle');
			if (!toggle || !nav.contains(toggle)) return;

			const isOpen = toggle.getAttribute('aria-expanded') === 'true';
			closeAllSubmenus(nav);
			toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
		});

		document.addEventListener('click', function(e) {
			if (!nav.contains(e.target)) {
				closeAllSubmenus(nav);
			}
		});
	}

	function initDrawer(toggle, nav) {
		function setOpen(open) {
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			toggle.classList.toggle('is-active', open);
			nav.classList.toggle('is-active', open);
			document.body.classList.toggle('disable-scroll', open);
			if (!open) {
				closeAllSubmenus(nav);
			}
		}

		toggle.addEventListener('click', function() {
			setOpen(toggle.getAttribute('aria-expanded') !== 'true');
		});

		// Escape closes the innermost thing first: an open sub-menu, then the drawer.
		document.addEventListener('keydown', function(e) {
			if (e.key !== 'Escape') return;

			const openSubmenu = nav.querySelector('.js-submenuToggle[aria-expanded="true"]');
			if (openSubmenu) {
				closeAllSubmenus(nav);
				openSubmenu.focus();
				return;
			}

			if (toggle.getAttribute('aria-expanded') === 'true') {
				setOpen(false);
				toggle.focus();
			}
		});

		// The toggle is hidden at desktop width; make sure the drawer state does
		// not persist if the viewport grows while it is open.
		function handleResize() {
			if (window.innerWidth >= DESKTOP_WIDTH) {
				setOpen(false);
			}
		}

		const debouncedResize = (window.CoreCode && window.CoreCode.debounce)
			? window.CoreCode.debounce(handleResize, 200)
			: handleResize;

		window.addEventListener('resize', debouncedResize);
	}

	function init() {
		const navs = document.querySelectorAll('.js-siteNav');
		if (navs.length === 0) return;

		navs.forEach(function(nav) {
			initSubmenus(nav);

			const toggle = document.querySelector('.js-siteNavToggle[aria-controls="' + nav.id + '"]');
			if (toggle) {
				initDrawer(toggle, nav);
			}
		});
	}

	if (document.readyState !== 'loading') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
