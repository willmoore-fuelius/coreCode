// Video Popup Module - Native Dialog Implementation
// Replaces Magnific Popup with native <dialog> element

document.addEventListener('DOMContentLoaded', function() {
	const popupTriggers = document.querySelectorAll('.js-trigger_video_popup');

	if (popupTriggers.length === 0) return;

	// Focus trap uses shared CoreCode.trapFocus from utilities.js
	var trapFocus = window.CoreCode && window.CoreCode.trapFocus ? window.CoreCode.trapFocus : function() {};

	popupTriggers.forEach(function(trigger) {
		trigger.addEventListener('click', function(e) {
			e.preventDefault();

			const targetSelector = trigger.getAttribute('href') || trigger.dataset.popupTarget;
			const targetContent = document.querySelector(targetSelector);

			if (!targetContent) return;

			// Create dialog if it doesn't exist
			const dialogId = targetSelector.replace('#', '') + '_dialog';
			let dialog = document.getElementById(dialogId);

			if (!dialog) {
				dialog = document.createElement('dialog');
				dialog.id = dialogId;
				dialog.className = 'm-popup';
				dialog.setAttribute('aria-label', 'Video popup');
				dialog.innerHTML = '<div class="m-popup__inner">' +
					'<button class="m-popup__close" aria-label="Close video popup">&times;</button>' +
					'<div class="m-popup__content">' + targetContent.innerHTML + '</div>' +
					'</div>';
				document.body.appendChild(dialog);

				// Close button handler
				const closeBtn = dialog.querySelector('.m-popup__close');
				closeBtn.addEventListener('click', function() {
					closeDialog(dialog, trigger);
				});

				// Close on backdrop click
				dialog.addEventListener('click', function(event) {
					if (event.target === dialog) {
						closeDialog(dialog, trigger);
					}
				});

				// Handle close event (Escape key built into dialog)
				dialog.addEventListener('close', function() {
					pauseVideos(dialog);
					// Return focus to trigger
					trigger.focus();
				});
			}

			// Show dialog, trap focus, and play video
			dialog.showModal();
			trapFocus(dialog);
			playVideos(dialog);
		});
	});

	function closeDialog(dialog, trigger) {
		pauseVideos(dialog);
		dialog.close();
		// Return focus to the element that opened the dialog
		if (trigger) {
			trigger.focus();
		}
	}

	function playVideos(dialog) {
		const videos = dialog.querySelectorAll('video');
		videos.forEach(function(video) {
			video.play();
		});
	}

	function pauseVideos(dialog) {
		// Pause HTML5 videos
		const videos = dialog.querySelectorAll('video');
		videos.forEach(function(video) {
			video.pause();
		});

		// Reset lite-youtube/lite-vimeo by removing iframes
		const liteYoutubes = dialog.querySelectorAll('lite-youtube');
		const liteVimeos = dialog.querySelectorAll('lite-vimeo');

		liteYoutubes.forEach(function(el) {
			const iframe = el.querySelector('iframe');
			if (iframe) {
				iframe.remove();
			}
		});

		liteVimeos.forEach(function(el) {
			const iframe = el.querySelector('iframe');
			if (iframe) {
				iframe.remove();
			}
		});
	}
});
