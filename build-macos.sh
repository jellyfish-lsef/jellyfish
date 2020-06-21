echo "[macOS] Building"
electron-packager . Jellyfish --app-version 0.2.0 --platform darwin --out ./build --overwrite --icon ./www/assets/icon.icns --asar --app-copyright "(c) 2020 theLMGN - Do not redistribute. Provided with NO warranty" --app-bundle-id com.thelmgn.jellyfish --darwin-dark-mode-support

