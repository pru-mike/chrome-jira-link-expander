'use strict';
(function (exports) {
  function isASCII(str) {
    // eslint-disable-next-line no-control-regex
    return /^[\x00-\x7F]*$/.test(str);
  }

  function wrapToTag(text, tag) {
    return `<${tag}>${text}</${tag}>`;
  };

  function openInNewTab(url) {
    chrome.tabs.create({
      url: url
    });
  }

  function openInTab(tab, url) {
    chrome.tabs.update(tab.id, {
      url: url
    });
  }

  function isNewTab(tab) {
    return tab.url === 'chrome://newtab/';
  }

  function openInActiveTab(url) {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      chrome.tabs.update(tabs[0].id, {
        url: url
      });
    });
  }

  function getJiraRestURL(ju) {
    return ju + 'rest/api/2/project?expand=description';
  }

  function getJiraBrowseURL(ju) {
    return ju + 'browse/';
  }

  function getJiraSearchURL(ju) {
    return ju +
      'rest/api/2/search?jql=watcher=currentUser()%20order%20by%20%22date%22%20desc&fields=%22%22';
  }

  function updateDefaultSuggestion(descr) {
    chrome.omnibox.setDefaultSuggestion({
      description: descr
    });
  }

  function getLocalStorage() {
    return new Promise((resolve, reject) => chrome.storage.local.get(null, resolve));
  }

  function addTrailerSlash(url) {
    url = url.trim();
    if (!url.endsWith('/')) {
      url = url + '/';
    }
    return url;
  }

  function findKey(issue) {
    return issue.split('-')[0];
  }

  exports.wrapToTag = wrapToTag;
  exports.openInNewTab = openInNewTab;
  exports.openInTab = openInTab;
  exports.openInActiveTab = openInActiveTab;
  exports.isNewTab = isNewTab;
  exports.updateDefaultSuggestion = updateDefaultSuggestion;
  exports.isASCII = isASCII;
  exports.getLocalStorage = getLocalStorage;
  exports.getJiraRestURL = getJiraRestURL;
  exports.getJiraBrowseURL = getJiraBrowseURL;
  exports.getJiraSearchURL = getJiraSearchURL;
  exports.addTrailerSlash = addTrailerSlash;
  exports.findKey = findKey;
}(typeof exports === 'undefined' ? this['utils'] = {} : exports));
