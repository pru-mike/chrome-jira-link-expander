'use strict';

var Chrome = require('../test/mockChrome');
global.chrome = new Chrome();
global.utils = require('../src/js/utils');
var assert = require('assert');
var jira = require('../src/js/jiraHint');

describe('utils', function () {
  it('findKey should return proper key', function () {
    assert.equal(utils.findKey('ABCD-123'), 'ABCD');
  });
  it('isASCII', function () {
    assert.ok(utils.isASCII('%'));
    assert.ok(!utils.isASCII('\xF1'));
  });
  it('addTrailerSlash', function () {
    assert.equal('http://xxx.com/', utils.addTrailerSlash('http://xxx.com/'));
    assert.equal('http://xxx.com/', utils.addTrailerSlash('http://xxx.com'));
    assert.equal('http://xxx.com/', utils.addTrailerSlash(' http://xxx.com '));
  });
});

describe('jiraHint', function () {
  var items = {
    jiraURL: 'http://jjjjirra/',
    projectKeys: ['ONE', 'TWO', 'THREE']
  };
  chrome.storage.local.set(items);
  var j = new jira.Hint();
  j.options._init_config();
  var opt = j.options;

  describe('Options', function () {
    it('should be loaded at startup', function () {
      assert.equal(utils.getJiraBrowseURL(opt.jiraURL), utils.getJiraBrowseURL(items.jiraURL));
      assert.deepEqual(opt.projectKeys, items.projectKeys);
    });

    it('isConfigured() should be true if options exists', function () {
      assert.ok(opt.isConfigured());
    });

    it('isConfigured() should be false if options does not exists', function () {
      j.options._updateConfig({});
      assert(!j.options.isConfigured());
      j.options._updateConfig(items);
    });
  });

  it('_issueRe should match something', function () {
    var j = new jira.Hint('ONE-123 xxx');
    let _res = j.findIssue();
    let res = [_res.projectId, _res.issueId];
    assert.deepEqual(res, ['ONE', 123]);
  });

  it('_issueRe should match something more', function () {
    var j = new jira.Hint(' asdfasd ONE-123 xxx');
    let _res = j.findIssue();
    let res = [_res.projectId, _res.issueId];
    assert.deepEqual(res, ['ONE', 123]);
  });

  it('makeURL should return right url', function () {
    assert.equal(j.makeURL('PRJ', 123), utils.getJiraBrowseURL(items.jiraURL) + 'PRJ-123');
  });

  describe('textToURL', function () {
    it('textToURL should return url on url', function () {
      var j = new jira.Hint('http://xxxx');
      assert.equal(j.textToURL(), 'http://xxxx');
    });

    it('textToURL should find right url', function () {
      var j = new jira.Hint('one 123 xxx');
      assert.equal(j.textToURL(), utils.getJiraBrowseURL(items.jiraURL) + 'ONE-123');
    });

    it('textToURL should find right url for default(first) project', function () {
      var j = new jira.Hint('asdasd 123 xxx');
      assert.equal(j.textToURL(), utils.getJiraBrowseURL(items.jiraURL) + 'ONE-123');
    });

    it('textToURL should find right url if project defined', function () {
      var j = new jira.Hint('one 123 xxx');
      assert.equal(j.textToURL('ZZZ'), utils.getJiraBrowseURL(items.jiraURL) +
        'ZZZ-123');
    });
  });

  it('makeDescription should return something pretty', function () {
    var j = new jira.Hint('http://xxxx/ABCD-123');
    assert.equal(j.makeDescription(), '<url>http://xxxx/<match>ABCD-123</match></url>');
    j = new jira.Hint('asdfaaasdf 12345');
    assert.equal(j.makeDescription(),
      '<url>http://jjjjirra/browse/<match>ONE-12345</match></url>');
    j = new jira.Hint('asdfaaasdf 12345');
    assert.equal(j.makeDescription('THREE'),
      '<url>http://jjjjirra/browse/<match>THREE-12345</match></url>');
  });

  it('makeDescription should work properly with project description', function () {
    var j = new jira.Hint('asdfaaasdf 12345');
    j.options.projectData = {
      'ONE': {
        'descr': 'description'
      }
    };
    assert.equal(j.makeDescription('ONE'),
      '<url>http://jjjjirra/browse/<match>ONE-12345</match></url><dim> | description</dim>'
    );
    assert.equal(j.makeDescription(),
      '<url>http://jjjjirra/browse/<match>ONE-12345</match></url><dim> | description</dim>'
    );
    assert.equal(j.makeDescription('TWO'),
      '<url>http://jjjjirra/browse/<match>TWO-12345</match></url>');
  });

  it('makeDescription on not configured object', function () {
    var j = new jira.Hint('asdfaaasdf 12345');
    var saveUrl = j.options.jiraURL;
    j.options.jiraURL = '';
    assert.equal(j.makeDescription('ONE'),
      '<dim>Please configure your extension</dim>'
    );
    j.options.jiraURL = saveUrl;
  });

  it('makeSuggestion should update updateDefaultSuggestion if project defined', function () {
    var j = new jira.Hint('three 123');
    j.makeSuggestion(() => {});
    assert.equal(chrome.omnibox.getDefaultSuggestion().description,
      '<url>http://jjjjirra/browse/<match>THREE-123</match></url>');
  });

  it(
    'makeSuggestion should update updateDefaultSuggestion and make suggestion if project not defined',
    function () {
      var j = new jira.Hint('asdfas 123 xxards');
      j.options.projectData = {};
      var suggestion = [];
      var suggestionSample = [{
        'content': 'http://jjjjirra/browse/TWO-123',
        'description': '<url>http://jjjjirra/browse/<match>TWO-123</match></url>'
      }, {
        'content': 'http://jjjjirra/browse/THREE-123',
        'description': '<url>http://jjjjirra/browse/<match>THREE-123</match></url>'
      }];
      j.makeSuggestion((s) => {
        suggestion = s;
      });
      assert.equal(chrome.omnibox.getDefaultSuggestion().description,
        '<url>http://jjjjirra/browse/<match>ONE-123</match></url>');
      assert.deepEqual(suggestion, suggestionSample);
    });

  it(
    'makeSuggestion should return correct answer if projectKey part defined',
    function () {
      var j = new jira.Hint('123 t');
      j.options.projectData = {};
      var suggestion = [];
      var suggestionSample = [{
        'content': 'http://jjjjirra/browse/THREE-123',
        'description': '<url>http://jjjjirra/browse/<match>THREE-123</match></url>'
      }];
      j.makeSuggestion((s) => {
        suggestion = s;
      });
      assert.equal(chrome.omnibox.getDefaultSuggestion().description,
        '<url>http://jjjjirra/browse/<match>TWO-123</match></url>');
      assert.deepEqual(suggestion, suggestionSample);
    });

  it('navigate with not configured object', function () {
    var j = new jira.Hint('three 123');
    var saveUrl = j.options.jiraURL;
    j.options.jiraURL = '';
    var openOptionsPageIsSet = false;
    global.chrome._runtime.openOptionsPage = function () {
      openOptionsPageIsSet = true;
    };
    j.navigate();
    assert.ok(openOptionsPageIsSet);
    j.options.jiraURL = saveUrl;
  });
});
