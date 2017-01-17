'use strict';

var chromeStorage = function () {
  this.items = {};
};

chromeStorage.prototype = {
  get local() {
    return this;
  },
  get onChanged() {
    return this;
  },
  addListener: function () {},
  set: function (items) {
    this.items = items;
  },
  get: function (type, callback) {
    callback(this.items);
  }
};

var mockChrome = function () {
  // eslint-disable-next-line new-cap
  this.storage = new chromeStorage();
  this.omnibox_defSuggestion = {};
  this._runtime = {
    openOptionsPage: function () {}
  };
};

mockChrome.prototype = {
  get omnibox() {
    return this;
  },
  get runtime() {
    return this;
  },
  openOptionsPage: function () {
    this._runtime.openOptionsPage();
  },
  setDefaultSuggestion: function (sugg) {
    this.omnibox_defSuggestion = sugg;
  },
  getDefaultSuggestion: function () {
    return this.omnibox_defSuggestion;
  }
};

module.exports = mockChrome;
