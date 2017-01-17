@echo off
call:callLint src\js\background.js
call:callLint src\js\utils.js
call:callLint src\js\jiraHint.js
call:callLint src\js\options.js
call:callLint test\test.js
call:callLint test\mockChrome.js
goto:eof

:callLint
call:callNode .\node_modules\.bin\eslint "%~1"
goto:eof

:callNode
echo "***" %~2 "***"
call %~1 %~2
goto:eof
