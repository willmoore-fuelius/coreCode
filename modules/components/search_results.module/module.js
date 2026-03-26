(function () {
  'use strict';

  function hsResultsPage(_resultsClass) {
    function buildResultsPage(_instance) {
      const resultTemplate = _instance.querySelector('.hs-search-results__template');
      const resultsSection = _instance.querySelector('.hs-search-results__listing');
      const searchParams = new URLSearchParams(window.location.search.slice(1));

      function getTerm() {
        return searchParams.get('term') || '';
      }

      function getOffset() {
        return parseInt(searchParams.get('offset')) || 0;
      }

      function addResult(title, url, description, featuredImage) {
        const newResult = document.importNode(resultTemplate.content, true);
        function isFeaturedImageEnabled() {
          if (newResult.querySelector('.hs-search-results__featured-image > img')) {
            return true;
          }
        }
        newResult.querySelector('.hs-search-results__title').innerHTML = '<a href="' + url + '">' + title + '</a>';
        newResult.querySelector('.js-siteSearchLink').href = url;
        newResult.querySelector('.hs-search-results__description').innerHTML = description;
        if (typeof featuredImage !== 'undefined' && isFeaturedImageEnabled()) {
          newResult.querySelector('.m-siteSearch__itemInner').classList.add('m-siteSearch__itemInner--hasimage');
          newResult.querySelector('.hs-search-results__featured-image > img').src = featuredImage;
          newResult.querySelector('.hs-search-results__featured-image img').outerHTML = '<a href="' + url + '"><img src="' + featuredImage + '" alt="" /></a>';
        } else {
          newResult.querySelector('.hs-search-results__featured-image').remove();
        }
        resultsSection.appendChild(newResult);
      }

      function fillResults(results) {
        results.results.forEach(function (result) {
          addResult(result.title, result.url, result.description, result.featuredImageUrl);
        });

        const countEl = document.querySelector('.js-searchResultsCount');
        if (countEl) {
          countEl.innerHTML = 'Showing <strong>' + results.total + '</strong> ' + (results.total == 1 ? 'result' : 'results') + ' for <strong>\'' + getTerm() + '\'</strong>';
        }
      }

      function emptyResults(searchedTerm) {
        resultsSection.innerHTML =
          '<div class="hs-search__no-results m-rte"><h2 class="h4">Sorry. There are no results for "' +
          searchedTerm +
          '"</h2>' +
          '<p>Try rewording your query, or browse through our site.</p></div>';
      }

      function setSearchBarDefault(searchedTerm) {
        const searchBars = document.querySelectorAll('.hs-search-field__input');
        searchBars.forEach(function (el) {
          el.value = searchedTerm;
        });
      }

      function httpRequest(term, offset) {
        const SEARCH_URL = '/_hcms/search?';
        const requestUrl = SEARCH_URL + searchParams + '&analytics=true';
        const searchContainer = document.querySelector('.m-siteSearch');

        fetch(requestUrl)
          .then(function (response) {
            if (!response.ok) {
              throw new Error('Server reached, error retrieving results.');
            }
            return response.json();
          })
          .then(function (data) {
            setSearchBarDefault(data.searchTerm);
            if (data.total > 0) {
              fillResults(data);
            } else {
              emptyResults(data.searchTerm);
            }
            if (searchContainer) {
              searchContainer.classList.remove('loading');
            }
          })
          .catch(function (error) {
            console.error('Search request failed:', error.message);
            if (searchContainer) {
              searchContainer.classList.remove('loading');
            }
            resultsSection.innerHTML =
              '<div class="hs-search__no-results m-rte"><p>Sorry, something went wrong. Please try again.</p></div>';
          });
      }

      if (getTerm()) {
        httpRequest(getTerm(), getOffset());
      }
    }

    const searchResults = document.querySelectorAll(_resultsClass);
    searchResults.forEach(function (el) {
      buildResultsPage(el);
    });
  }

  if (document.readyState !== 'loading') {
    hsResultsPage('div.hs-search-results');
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      hsResultsPage('div.hs-search-results');
    });
  }
})();
