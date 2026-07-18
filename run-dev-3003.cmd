@echo off
cd /d "C:\Users\red\Documents\Codex\bb\bb creation panel"
echo [%date% %time%] Starting dev server on port 3003 > .next-dev-3003.log
call npm.cmd run dev -- --port 3003 >> .next-dev-3003.log 2>&1
