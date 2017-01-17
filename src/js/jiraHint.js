'use strict';
(function (exports) {
  // http://stackoverflow.com/questions/8694725/increasing-the-number-of-suggests-shown-in-omnibox
  const CHROME_MAX_SUGGESTION = 6;

  var jiraOptions = function () {
    this.jiraURL = '';
    this.projectKeys = [];
    this.projectData = {};
    this._issueRe = new RegExp('^$', 'i');
    this._init_config();
    this.update();
  };

  jiraOptions.prototype = {
    isConfigured: function () {
      return this.projectKeys.length !== 0 && this.jiraURL.length !== 0;
    },

    update: function () {
      this._upd_config().then(
        (change, area) => {
          let items = {
            jiraURL: this.jiraURL,
            projectKeys: this.projectKeys,
            projectData: this.projectData
          };
          if (change.jiraURL) {
            items.jiraURL = change.jiraURL.newValue;
          }
          if (change.projectKeys) {
            items.projectKeys = change.projectKeys.newValue;
          }
          if (change.projectData) {
            items.projectData = change.projectData.newValue;
          }
          this._updateConfig(items);
          this.update();
        }
      );
    },

    _init_config: function () {
      this._get_config().then((i) => this._updateConfig(i));
    },

    _upd_config: function () {
      return new Promise((resolve, reject) => chrome.storage.onChanged.addListener(resolve));
    },

    _get_config: function () {
      return utils.getLocalStorage();
    },

    _updateConfig: function (items) {
      this.jiraURL = items.jiraURL || '';
      this.projectKeys = items.projectKeys || [];
      this.projectData = items.projectData || {};
      this._updateSearchRegex();
    },

    _updateSearchRegex: function () {
      if (this.projectKeys.length) {
        let projectsAlt = this.projectKeys.join('|');
        let caseReStr = '(?:(' + projectsAlt + ')' + '.*?' + '(\\d+)|(\\d+))(?:\\s+(.+))?';
        this._issueRe = new RegExp(caseReStr, 'i');
      }
    }
  };

  var jiraHint = function (text) {
    this.inputText = text;
  };

  jiraHint.prototype = {

    options: new jiraOptions(),

    get projectKeys() {
      return this.options.projectKeys;
    },

    getProjectDescription: function (pKey) {
      let pData = this.options.projectData[pKey];
      if (pData) {
        return pData.descr;
      }
      return;
    },

    get jiraURL() {
      return this.options.jiraURL;
    },

    get isConfigured() {
      return this.options.isConfigured();
    },

    findIssue: function () {
      let _jiraStrRegexp = this.inputText.match(this.options._issueRe);
      let jiraIssue = {};
      if (_jiraStrRegexp[3] === undefined) {
        jiraIssue = {
          projectId: _jiraStrRegexp[1],
          issueId: _jiraStrRegexp[2]
        };
      } else {
        jiraIssue = {
          issueId: _jiraStrRegexp[3],
          projectIdPart: _jiraStrRegexp[4]
        };
      }
      return jiraIssue;
    },

    makeURL: function (projectId, jiraIssueId) {
      return utils.getJiraBrowseURL(this.jiraURL) + projectId + '-' + jiraIssueId;
    },

    findDefaultProjectId: function () {
      let jiraIssue = this.findIssue();
      let res = {
        issueId: jiraIssue.issueId
      };
      if (jiraIssue.projectId) {
        res.projectId = jiraIssue.projectId.toUpperCase();
      } else {
        res.projectId = this.projectKeys[0];
      }
      return res;
    },

    textToURL: function (projectId) {
      var URL = this.jiraURL;
      if (/^\s*https?:\/\//.test(this.inputText)) {
        URL = this.inputText;
      } else if (this.isConfigured) {
        if (projectId) {
          let jiraIssue = this.findIssue();
          if (jiraIssue.issueId) {
            URL = this.makeURL(projectId, jiraIssue.issueId);
          }
        } else {
          let {
            projectId,
            issueId
          } = this.findDefaultProjectId();
          URL = this.makeURL(projectId, issueId);
        }
      }
      return URL;
    },

    makeDescription: function (projectId) {
      var url = this.textToURL(projectId);
      var description;
      if (this.isConfigured) {
        let urlParts = url.split('/');
        if (urlParts && urlParts.length) {
          description = utils.wrapToTag(urlParts.slice(0, urlParts.length - 1).join('/') +
            '/' + utils.wrapToTag(urlParts[urlParts.length - 1], 'match'), 'url');
          if (!projectId) {
            ({
              projectId
            } = this.findDefaultProjectId());
          }
          let prjDescr = this.getProjectDescription(projectId);
          if (prjDescr) {
            description += utils.wrapToTag(' | ' + prjDescr, 'dim');
          }
        } else {
          description = utils.wrapToTag(url, 'url');
        }
      } else {
        description = utils.wrapToTag('Please configure your extension', 'dim');
      }
      return description;
    },

    _makeSuggestion: function* () {
      let jiraIssue = this.findIssue();
      if (jiraIssue.projectId) {
        utils.updateDefaultSuggestion(this.makeDescription());
      } else {
        let projectKeys = this.projectKeys;
        let found = 0;
        if (jiraIssue.projectIdPart) {
          let partRe = new RegExp('^' + jiraIssue.projectIdPart, 'i');
          for (let i = 0; i < projectKeys.length && found <= CHROME_MAX_SUGGESTION; i++) {
            let projectKey = projectKeys[i];
            if (partRe.test(projectKey)) {
              if (!found) {
                utils.updateDefaultSuggestion(this.makeDescription(projectKey));
              } else {
                yield {
                  content: this.textToURL(projectKey),
                  description: this.makeDescription(projectKey)
                };
              }
              found++;
            }
          }
        }
        if (!found) {
          utils.updateDefaultSuggestion(this.makeDescription(projectKeys[0]));
          for (let i = 1; i < projectKeys.length && i <= CHROME_MAX_SUGGESTION; i++) {
            yield {
              content: this.textToURL(projectKeys[i]),
              description: this.makeDescription(projectKeys[i])
            };
          }
        }
      }
    },

    makeSuggestion: function (suggest) {
      let g = this._makeSuggestion();
      var results = [];
      for (let res of g) {
        results.push({
          content: res.content,
          description: res.description
        });
      }
      suggest(results);
    },

    navigate: function () {
      var url = this.textToURL();
      if (!this.isConfigured) {
        chrome.runtime.openOptionsPage();
      } else {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function (tabs) {
          utils.isNewTab(tabs[0]) ? utils.openInTab(tabs[0], url) : utils.openInNewTab(
            url);
        });
      }
    }

  };

  exports.Hint = jiraHint;
}(typeof exports === 'undefined' ? this['jira'] = {} : exports));
