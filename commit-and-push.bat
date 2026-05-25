@echo off
REM Commit and Push Batch Wrapper
REM Navigate to script directory and run PowerShell script

pushd "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "commit-and-push.ps1" %*
popd
