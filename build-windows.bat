@echo [Windows] Building
mkdir builds
cmd /C electron-packager . Jellyfish --exclude=docs --app-version 2.1.0 --protocol=jellyfish-lsef --platform win32 --arch=ia32 --out .\builds --overwrite --icon ..\jellyfish-ui\assets\icon-win.ico --asar --app-copyright "(c) 2020 theLMGN - Do not redistribute. Provided with NO warranty" --app-bundle-id com.thelmgn.jellyfish --darwin-dark-mode-support
copy JellyDriver-SynapseX.exe builds\Jellyfish-win32-ia32\
copy sxlib.dll builds\Jellyfish-win32-ia32\
copy JellyInjector-SirHurt.exe builds\Jellyfish-win32-ia32\