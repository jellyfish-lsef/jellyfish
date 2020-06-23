echo "[macOS] Building"
VERSION="1.0.2"
mkdir builds
mv docs ~/JellyfishBuilderDocsTemp
electron-packager . Jellyfish --exclude=docs --app-version "$VERSION" --platform darwin --out ./builds --overwrite --icon ./www/assets/icon.icns --asar --app-copyright "(c) 2020 theLMGN - Do not redistribute. Provided with NO warranty" --app-bundle-id com.thelmgn.jellyfish --darwin-dark-mode-support
mv ~/JellyfishBuilderDocsTemp docs
cd ./builds
mv Jellyfish-darwin-x64 "Jellyfish-$VERSION"
cd "Jellyfish-$VERSION"

zip -r9 "Jellyfish-$VERSION.zip" Jellyfish.app
mv "Jellyfish-$VERSION.zip" ../
cd ../..
#rm -rf "builds"