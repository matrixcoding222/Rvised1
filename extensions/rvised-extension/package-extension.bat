@echo off
echo Creating Chrome Extension package for Web Store submission...

REM Clean up old builds
if exist rvised-extension.zip del rvised-extension.zip
if exist temp-build rmdir /s /q temp-build

REM Create temp directory
mkdir temp-build

REM Copy necessary files
xcopy /s /e /i background temp-build\background
xcopy /s /e /i content temp-build\content
xcopy /s /e /i popup temp-build\popup
xcopy /s /e /i icons temp-build\icons
copy manifest.json temp-build\

REM Copy the glasses icon
copy ..\..\glasses.svg temp-build\icons\

REM Create zip file
cd temp-build
powershell -command "Compress-Archive -Path * -DestinationPath ..\rvised-extension.zip"
cd ..

REM Clean up
rmdir /s /q temp-build

echo.
echo ✅ Extension package created: rvised-extension.zip
echo.
echo This file is ready for Chrome Web Store submission!
pause