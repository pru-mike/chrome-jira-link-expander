@echo off
call:callBtfy src\js\background.js
call:callBtfy src\js\utils.js
call:callBtfy src\js\jiraHint.js
call:callBtfy src\js\options.js
call:callBtfy test\test.js
call:callBtfy test\mockChrome.js
call:callBtfy "--type html src\html\options.html"
goto:eof

:callBtfy
call:callNode ".\node_modules\.bin\js-beautify -r" "%~1"
goto:eof

:callNode
echo "***" %~2 "***"
call %~1 %~2
goto:eof
