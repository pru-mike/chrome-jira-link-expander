#!/bin/sh

function Run {
 echo "***" $2 "***"
 $1 $2
}

function callBtfy {
 Run "./node_modules/.bin/js-beautify -r" "$1"
}

callBtfy src/js/background.js
callBtfy src/js/utils.js
callBtfy src/js/jiraHint.js
callBtfy src/js/options.js
callBtfy test/test.js
callBtfy test/mockChrome.js
callBtfy "--type html src/html/options.html"
