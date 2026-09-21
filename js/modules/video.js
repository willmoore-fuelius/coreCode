// Video player — initialises Plyr on any .js-videoPlayer element.
// The vendor script and this file are both required in the footer by
// video_helpers.html, and footer scripts run in order, so Plyr is defined by
// the time this executes. No polling.

(function() {
	'use strict';

	function init() {
		const players = document.querySelectorAll('.js-videoPlayer:not(.is-initialised)');
		if (players.length === 0) return;

		if (typeof Plyr === 'undefined') {
			console.warn('Plyr is not loaded — video players cannot initialise. Ensure vendor.plyr.js is required on this template.');
			return;
		}

		players.forEach(function(player) {
			player.classList.add('is-initialised');

			new Plyr(player, {
				controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'fullscreen'],
				ratio: player.dataset.videoRatio || '16:9'
			});
		});
	}

	if (document.readyState !== 'loading') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
