@echo off
:: Generate manifest.json from files in this directory
:: Run this after adding new test files

echo {"files": [ > manifest.json.tmp
setlocal enabledelayedexpansion
set first=1
for %%f in (*) do (
    if not "%%f"=="manifest.json" if not "%%f"=="manifest.json.tmp" if not "%%f"=="generate-manifest.bat" (
        if !first!==0 echo , >> manifest.json.tmp
        set first=0
        echo "%%f" >> manifest.json.tmp
    )
)
echo ]} >> manifest.json.tmp
move /y manifest.json.tmp manifest.json >nul
echo manifest.json generated successfully
pause
