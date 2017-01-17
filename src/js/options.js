'use strict';

function restoreOptions() {
  utils.getLocalStorage().then(function (items) {
    document.getElementById('input-jira-url').value = items.jiraURL || '';
    document.getElementById('area-project-keys').value = items.projectKeys.join(' ');
    if (!items.jiraURL) {
      disableLoadButton();
    } else {
      enableLoadButton();
    }
  });
}

function disableLoadButton() {
  document.getElementById('btn-load').disabled = true;
}

function enableLoadButton() {
  document.getElementById('btn-load').disabled = false;
}

function getProjectKeys() {
  return document.getElementById('area-project-keys').value || '';
}

function getJiraURL() {
  return utils.addTrailerSlash(document.getElementById('input-jira-url').value);
}

function getProjectsKeysArray() {
  return getProjectKeys()
    .split(' ').filter((elem) => !/^\s*$/.test(elem)) || [];
}

function saveOptions(pData) {
  utils.getLocalStorage().then(function (items) {
    var obj = {
      jiraURL: getJiraURL(),
      projectKeys: getProjectsKeysArray()
    };
    if (pData) {
      obj.projectData = pData;
    } else {
      obj.projectData = items.projectData;
    }
    chrome.storage.local.set(obj);
    restoreOptions();
  });
}

function clearLoadMsg() {
  document.getElementById('div-load-msg').textContent = '';
}

function showLoadError(e) {
  showLoadMsg(e, 'error');
}

function showLoadSuccess(e) {
  showLoadMsg(e, 'success');
}

function showLoadMsg(e, msgClass) {
  console.log(e.message);
  var msg = document.getElementById('div-load-msg');
  msg.textContent = e.message;
  msg.className = 'msg' + ' ' + msgClass;
  enableLoadButton();
}

function fetchUrl(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            json: function () {
              return JSON.parse(xhr.responseText);
            }
          });
        } else {
          reject({
            message: xhr.status + ': ' + xhr.statusText
          });
        }
      }
    };
    xhr.ontimeout = function () {
      reject({
        message: 'Request timeout'
      });
    };
    xhr.onerror = function () {
      if (xhr.status) {
        reject({
          message: xhr.status + ': ' + xhr.statusText
        });
      } else {
        reject({
          message: 'Request processing error'
        });
      }
    };
    xhr.open('GET', url, true);
    xhr.timeout = 3000;
    xhr.send();
  });
}

function checkPermission(url) {
  return new Promise(function (resolve, reject) {
    chrome.permissions.contains({
      permissions: ['webRequest'],
      origins: [url]
    }, function (hasPermission) {
      if (hasPermission) {
        resolve(true);
      } else {
        chrome.permissions.request({
          permissions: ['webRequest'],
          origins: [url]
        }, function (granted) {
          if (!granted) {
            reject({
              message: 'Permission not granted'
            });
          } else {
            resolve(true);
          }
        });
      }
    });
  });
}

function btnLoadHandler() {
  clearLoadMsg();
  disableLoadButton();
  var pData = {};
  // eslint-disable-next-line no-return-assign
  getProjectsKeysArray().forEach((i) => pData[i] = {
    'descr': ''
  });

  var setInitialOrder = function (searchRes) {
    var issueList = searchRes.issues;
    issueList.forEach((i) => {
      let key = utils.findKey(i.key);
      pData[key] = {};
    });
  };

  var fillPrjList = function (projectsList) {
    projectsList.forEach((i) => {
      // chrome option page utf8 bug?
      if (utils.isASCII(i.name)) {
        pData[i.key] = {
          'descr': i.name
        };
      } else {
        pData[i.key] = {
          'descr': ''
        };
      }
    });
    document.getElementById('area-project-keys').value = Object.keys(pData).join(' ');
    if (!document.getElementById('chbx-load-prj-descr').checked) {
      pData = {};
    }
    showLoadSuccess({
      message: 'Load succesfull'
    });
    saveOptions(pData);
  };

  var jiraUrl = getJiraURL();
  var restUrl = utils.getJiraRestURL(jiraUrl);
  var searchUrl = utils.getJiraSearchURL(jiraUrl);
  checkPermission(jiraUrl)
    .then(() => fetchUrl(searchUrl))
    .then((response) =>
      response.json())
    .then(setInitialOrder)
    .then(() => fetchUrl(restUrl))
    .then((response) =>
      response.json())
    .then(fillPrjList)
    .catch((e) => showLoadError(e));
}

function chbxLoadPrjDescOpt() {
  if (!document.getElementById('chbx-load-prj-descr').checked) {
    saveOptions({});
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('input-jira-url').addEventListener('focusout', () => saveOptions());
document.getElementById('area-project-keys').addEventListener('focusout', () => saveOptions());
document.getElementById('area-project-keys').addEventListener('focusin', clearLoadMsg);
document.getElementById('btn-load').addEventListener('click', btnLoadHandler);
document.getElementById('chbx-load-prj-descr').addEventListener('change', chbxLoadPrjDescOpt);
