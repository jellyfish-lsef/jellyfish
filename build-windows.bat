@echo [Windows] Building
mkdir builds
start electron-packager . Jellyfish --exclude=docs --app-version 1.2.0 --protocol=jellyfish-lsef --platform win32 --out ./builds --overwrite --icon ./www/assets/icon-win.ico --asar --app-copyright "(c) 2020 theLMGN - Do not redistribute. Provided with NO warranty" --app-bundle-id com.thelmgn.jellyfish --darwin-dark-mode-support
pause
copy ./JellyDriver-SynapseX.exe builds/Jellyfish-win32-x64/
copy ./sxlib.dll builds/Jellyfish-win32-x64/
copy ./JellyDriver-SirHurt.exe builds/Jellyfish-win32-x64/