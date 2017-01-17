'use strict';
(function () {
  chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    (new jira.Hint(text)).makeSuggestion(suggest);
  });
  chrome.omnibox.onInputEntered.addListener(function (text) {
    (new jira.Hint(text)).navigate();
  });
  chrome.contextMenus.create({
    title: 'Open in JIRA',
    contexts: ['selection'],
    onclick: function (o, tab) {
      (new jira.Hint(o.selectionText)).navigate();
    }
  });
}());
