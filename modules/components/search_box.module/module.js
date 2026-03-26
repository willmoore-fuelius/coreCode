(function () {
  'use strict';

  function hsSearch(_instance) {
    const TYPEAHEAD_LIMIT = 3;
    const ACTIVE_CLASS = 'active';

    let searchTerm = '';
    const searchWrapper = _instance;
    const searchFormWrapper = _instance.querySelector('.js-searchFormWrapper');
    const searchForm = _instance.querySelector('.js-searchForm');
    const searchField = _instance.querySelector('.js-searchInput');
    const searchResults = _instance.querySelector('.js-searchFieldSuggestions');
    const searchToggle = _instance.querySelector('.js-searchToggle');
    const body = document.body;

    function searchOptions() {
      const formParams = [];
      const form = _instance.querySelector('form');
      form.querySelectorAll('input[type=hidden]').forEach(function (e) {
        if (e.name !== 'limit') {
          formParams.push(
            encodeURIComponent(e.name) + '=' + encodeURIComponent(e.value)
          );
        }
      });
      return formParams.join('&');
    }

    searchToggle.addEventListener('click', function () {
      if (searchFormWrapper.classList.contains(ACTIVE_CLASS)) {
        searchFormWrapper.classList.remove(ACTIVE_CLASS);
        body.classList.remove('search-' + ACTIVE_CLASS);
      } else {
        searchFormWrapper.classList.add(ACTIVE_CLASS);
        searchForm.style.display = 'block';
        body.classList.add('search-' + ACTIVE_CLASS);
      }
    });

    // Use shared debounce from CoreCode.debounce (utilities.js)
    const debounce = window.CoreCode && window.CoreCode.debounce ? window.CoreCode.debounce : function(fn) { return fn; };

    function emptySearchResults() {
      searchResults.innerHTML = '';
      searchField.focus();
      searchWrapper.classList.remove('open');
    }

    function fillSearchResults(response) {
      const items = response.results.map(function (val, index) {
        return '<li class="m-searchBox__resultsItem" id="result' + index + '">' +
          '<a class="m-searchBox__resultsLink" href="' + val.url + '">' + val.title + '</a>' +
          '</li>';
      });

      emptySearchResults();
      searchResults.innerHTML = items.join('');
      searchWrapper.classList.add('open');
    }

    function getSearchResults() {
      searchForm.classList.add('spinner');
      const requestUrl =
        '/_hcms/search?&term=' +
        encodeURIComponent(searchTerm) +
        '&limit=' +
        encodeURIComponent(TYPEAHEAD_LIMIT) +
        '&autocomplete=true&' +
        searchOptions();

      fetch(requestUrl)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Server reached, error retrieving results.');
          }
          return response.json();
        })
        .then(function (data) {
          if (data.total > 0) {
            fillSearchResults(data);
            trapFocus();
          } else {
            emptySearchResults();
            searchResults.innerHTML = '<li class="m-searchBox__resultsItem m-searchBox__resultsItem--no-results">No results</li>';
            searchWrapper.classList.add('open');
          }
        })
        .catch(function (error) {
          console.error(error.message || 'Could not reach the server.');
        })
        .finally(function () {
          searchForm.classList.remove('spinner');
        });
    }

    function trapFocus() {
      const tabbable = [searchField].concat(Array.from(searchResults.querySelectorAll('a')));
      const first = tabbable[0];
      const last = tabbable[tabbable.length - 1];

      searchWrapper.addEventListener('keydown', function (e) {
        switch (e.key) {
          case 'Tab':
            if (e.target === last && !e.shiftKey) {
              e.preventDefault();
              first.focus();
            } else if (e.target === first && e.shiftKey) {
              e.preventDefault();
              last.focus();
            }
            break;
          case 'Escape':
            emptySearchResults();
            break;
          case 'ArrowUp':
            e.preventDefault();
            const prev = tabbable.indexOf(e.target) - 1;
            if (prev < 0) last.focus();
            else tabbable[prev].focus();
            break;
          case 'ArrowDown':
            e.preventDefault();
            const next = tabbable.indexOf(e.target) + 1;
            if (next >= tabbable.length) first.focus();
            else tabbable[next].focus();
            break;
        }
      });
    }

    const isSearchTermPresent = debounce(function () {
      searchTerm = searchField.value;
      if (searchTerm.length > 2) {
        getSearchResults();
        searchFormWrapper.classList.add('has-results');
      } else if (searchTerm.length === 0) {
        emptySearchResults();
        searchFormWrapper.classList.remove('has-results');
      }
    }, 250);

    searchField.addEventListener('input', function () {
      if (searchTerm !== searchField.value) {
        isSearchTermPresent();
      }
    });
  }

  function init() {
    const searchWrappers = document.querySelectorAll('.js-searchWrapper');
    searchWrappers.forEach(function (el) {
      hsSearch(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
