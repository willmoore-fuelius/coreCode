(function () {
  'use strict';

  const blogFilterInput = document.querySelector('.js-blog_filter__term');
  const blogFilterTagsDropdown = document.querySelector('.js-filter__tags');
  const blogFilterForm = document.querySelector('.js-filter__form');

  if (!blogFilterForm) return;

  blogFilterForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let searchParams = '';
    const baseUrl = window.location.protocol + '//' + window.location.host;
    const blogName = blogFilterForm.dataset.blogname;

    if (blogFilterInput && blogFilterInput.value.trim().length > 0) {
      searchParams = '?term=' + encodeURIComponent(blogFilterInput.value.trim());
    }

    if (!blogFilterTagsDropdown || blogFilterTagsDropdown.value === 'all') {
      window.location.href = baseUrl + '/' + blogName + '/' + searchParams;
    } else {
      window.location.href = baseUrl + '/' + blogName + '/tag/' + blogFilterTagsDropdown.value + searchParams;
    }
  });
})();
