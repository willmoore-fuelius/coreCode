(function () {
  'use strict';

  const siteHeader = document.querySelector('.js-siteheader:not(html.hs-inline-edit .js-siteheader)');
  const siteFooter = document.querySelector('.js-sitefooter:not(html.hs-inline-edit .js-sitefooter)');
  const stickyLinks = document.querySelector('.js-stickylinks');
  const slNavToggle = document.querySelector('.js-slnavtoggle');
  const slNav = document.querySelector('.js-slnav');
  const slLinks = document.querySelectorAll('.js-sllink');
  const modules = document.querySelectorAll('.js-module');

  if (!stickyLinks) return;

  const stickyTop = stickyLinks.offsetTop + (stickyLinks.offsetParent ? stickyLinks.offsetParent.offsetTop : 0);
  let resizeTimeout;
  const activeClass = 'active';
  const fixedClass = 'fixed';

  // Mobile nav toggle
  if (slNavToggle && slNav) {
    slNavToggle.addEventListener('click', function () {
      this.classList.toggle(activeClass);
      slNav.style.display = slNav.style.display === 'none' ? '' : 'none';
    });
  }

  // Close nav on link click
  slLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (slNavToggle) slNavToggle.classList.remove(activeClass);
      if (slNav) slNav.style.display = 'none';
    });
  });

  function updateHeaderHeight() {
    if (siteHeader) {
      const headerHeight = siteHeader.offsetHeight;
      document.documentElement.style.setProperty('--siteHeaderHeight', headerHeight + 'px');
    }
  }

  function getSiteHeaderHeight() {
    return siteHeader ? siteHeader.offsetHeight : 0;
  }

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      updateHeaderHeight();
    }, 200);
  });

  window.addEventListener('orientationchange', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      updateHeaderHeight();
    }, 200);
  });

  function scrNav() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    modules.forEach(function (module) {
      const id = module.getAttribute('id');
      const offset = module.offsetTop - 1;
      const height = module.offsetHeight;

      if (scrollTop >= offset && scrollTop < offset + height) {
        slLinks.forEach(function (link) {
          link.classList.remove(activeClass);
        });
        const activeLink = stickyLinks.querySelector('[href="#' + id + '"]');
        if (activeLink) {
          activeLink.classList.add(activeClass);
        }
      }
    });
  }

  function isInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.bottom > 0 &&
      rect.top < (window.innerHeight || document.documentElement.clientHeight)
    );
  }

  function setSticky() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const headerHeight = getSiteHeaderHeight();
    const footerVisible = isInViewport(siteFooter);

    if (scrollTop >= stickyTop - headerHeight) {
      if (!stickyLinks.classList.contains(fixedClass) && !footerVisible) {
        stickyLinks.classList.add(fixedClass);
        stickyLinks.style.display = '';
      } else if (footerVisible) {
        stickyLinks.classList.remove(fixedClass);
        stickyLinks.style.display = 'none';
      }
    } else if (scrollTop + window.innerHeight > stickyTop && scrollTop < stickyTop) {
      stickyLinks.classList.remove(fixedClass);
    }
  }

  scrNav();
  setSticky();
  updateHeaderHeight();

  let scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        scrNav();
        setSticky();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
})();
