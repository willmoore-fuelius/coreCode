// Video Popup Module - Native <dialog> implementation
// A trigger with class .js-trigger_video_popup opens the element referenced
// by its href (an in-page "#id" fragment) inside a modal dialog.
//
// The native <dialog> element (opened with showModal) handles the focus
// containment, backdrop, and Escape-to-close, so no manual focus trap is
// added here. Content is moved into the dialog (not cloned) so element IDs
// are never duplicated, then moved back to its original position on close.
//
// Markup contract: the referenced element should be a visible container (or
// have no self-applied `display:none`). It is revealed inside the dialog by
// being moved into it; a source hidden via its own CSS class would stay hidden.

(function() {
	'use strict';

	// Only one popup may be open at a time; guards against a second trigger
	// firing while a dialog is already open and stacking an empty modal.
	let popupOpen = false;

	function init() {
		const triggers = document.querySelectorAll('.js-trigger_video_popup');
		if (triggers.length === 0) return;

		triggers.forEach(function(trigger) {
			trigger.addEventListener('click', function(e) {
				e.preventDefault();

				if (popupOpen) return;

				const targetSelector = trigger.getAttribute('href') || trigger.dataset.popupTarget;

				// Only accept an in-page fragment identifier ("#id"), never a URL or bare "#".
				if (!targetSelector || targetSelector.charAt(0) !== '#' || targetSelector.length < 2) return;

				let content;
				try {
					content = document.querySelector(targetSelector);
				} catch (err) {
					return;
				}

				if (!content) return;

				openPopup(content, trigger);
			});
		});
	}

	function openPopup(content, trigger) {
		// Capture the original location so the node can be returned exactly, and
		// so it is never lost if the surrounding DOM is re-rendered while open.
		const originalParent = content.parentNode;
		const originalNextSibling = content.nextSibling;

		const dialog = document.createElement('dialog');
		dialog.className = 'm-popup';
		dialog.setAttribute('aria-label', trigger.getAttribute('aria-label') || 'Video popup');

		const inner = document.createElement('div');
		inner.className = 'm-popup__inner';

		const closeBtn = document.createElement('button');
		closeBtn.type = 'button';
		closeBtn.className = 'm-popup__close js-popupClose';
		closeBtn.setAttribute('aria-label', 'Close video popup');
		closeBtn.innerHTML = '&times;';

		const contentWrap = document.createElement('div');
		contentWrap.className = 'm-popup__content';
		contentWrap.appendChild(content); // Move the live node in — no ID duplication.

		inner.appendChild(closeBtn);
		inner.appendChild(contentWrap);
		dialog.appendChild(inner);
		document.body.appendChild(dialog);

		let restored = false;
		function restore() {
			if (restored) return;
			restored = true;
			pauseVideos(dialog);

			// Return the node to where it came from. If the original parent is no
			// longer in the document, fall back to body so the node is never lost.
			if (originalParent && originalParent.isConnected) {
				originalParent.insertBefore(content, originalNextSibling);
			} else {
				document.body.appendChild(content);
			}

			dialog.remove();
			popupOpen = false;
			if (trigger) {
				trigger.focus();
			}
		}

		closeBtn.addEventListener('click', function() {
			dialog.close();
		});

		// Close on backdrop click.
		dialog.addEventListener('click', function(event) {
			if (event.target === dialog) {
				dialog.close();
			}
		});

		// Fires for both the close button and the Escape key.
		dialog.addEventListener('close', restore);

		popupOpen = true;
		dialog.showModal();
		playVideos(dialog);
	}

	function playVideos(dialog) {
		const videos = dialog.querySelectorAll('video');
		videos.forEach(function(video) {
			const playPromise = video.play();
			if (playPromise && typeof playPromise.catch === 'function') {
				playPromise.catch(function() { /* autoplay may be blocked — ignore */ });
			}
		});
	}

	function pauseVideos(dialog) {
		// Pause HTML5 videos.
		const videos = dialog.querySelectorAll('video');
		videos.forEach(function(video) {
			video.pause();
		});

		// Reset each lite-youtube by removing its injected iframe AND the
		// activation class, otherwise the vendor's addIframe guard short-circuits
		// on the next play and the video can never be replayed.
		const liteYoutubes = dialog.querySelectorAll('lite-youtube');
		liteYoutubes.forEach(function(el) {
			const iframe = el.querySelector('iframe');
			if (iframe) {
				iframe.remove();
			}
			el.classList.remove('lyt-activated');
		});
	}

	if (document.readyState !== 'loading') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
