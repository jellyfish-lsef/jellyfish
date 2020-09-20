echo "[macOS] Building"
VERSION="$(node ./getVersion.js)"
mkdir builds
electron-packager . Jellyfish-BETA --exclude=docs --app-version "$VERSION" --protocol=jellyfish-lsef --platform darwin --out ./builds --overwrite --icon ../jellyfish-ui/assets/icon-beta.icns --asar --app-copyright "(c) 2020 theLMGN - Do not redistribute. Provided with NO warranty" --app-bundle-id com.thelmgn.jellyfish --darwin-dark-mode-support
#electron-packager . Jellyfish --exclude=docs --app-version "$VERSION" --protocol=jellyfish-lsef --platform darwin --out ./builds --overwrite --icon ../jellyfish-ui/assets/icon.icns --asar --app-copyright "(c) 2020 theLMGN - Do not redistribute. Provided with NO warranty" --app-bundle-id com.thelmgn.jellyfish --darwin-dark-mode-support
cd ./builds
mv Jellyfish-darwin-x64 "Jellyfish-$VERSION"
cd "Jellyfish-$VERSION"

#zip -r9 "Jellyfish-$VERSION.zip" Jellyfish.app
mv "Jellyfish-$VERSION.zip" ../
cd ../..
#rm -rf "builds"