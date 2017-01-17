#!/bin/sh

function Run {
 echo "***" $2 "***"
 $1 $2
}

function callLint {
 Run ./node_modules/.bin/eslint $1
}

callLint src/js/background.js
callLint src/js/utils.js
callLint src/js/jiraHint.js
callLint src/js/options.js
callLint test/test.js
callLint test/mockChrome.js
