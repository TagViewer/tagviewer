pkgname="tagviewer"
pkgver=1.0.0
pkgrel=1
pkgdesc="Add metadata to media repositories."
arch=("x86_64")
url="https://github.com/TagViewer/tagviewer"
license=('GPL3')
makedepends=('yarn' 'nodejs-less' 'unzip')
source=("https://api.github.com/repos/TagViewer/tagviewer/tarball")
md5sums=('de6a1c236c2250eee479fe4ec8083ac4')

build() {
  cd $(ls | grep "TagViewer-tagviewer" | sed 's/$/\//')
  yarn
  for file in *.less; do lessc -x $file `basename $file`.css ; done
  [ ! -f "$(ls | grep "TagViewer-tagviewer")/out/make/zip/linux/x64/TagViewer-linux-x64-$pkgver.zip" ] && ./node_modules/.bin/electron-forge make --targets @electron-forge/maker-zip
}

package() {
  mkdir -p "$pkgdir/usr/bin"
  mkdir -p "$pkgdir/usr/lib/$pkgname"
  mkdir -p "$pkgdir/usr/share/applications"
  mkdir -p "$pkgdir/usr/share/lintian/overrides"
  mkdir -p "$pkgdir/usr/share/pixmaps"
  cp "$(ls | grep "TagViewer-tagviewer")/out/make/zip/linux/x64/TagViewer-linux-x64-$pkgver.zip" .
  unzip "TagViewer-linux-x64-$pkgver.zip"
  cd "TagViewer-linux-x64"
  cp -r . "$pkgdir/usr/lib/$pkgname"
  cat << EOF > "$pkgdir/usr/share/applications/$pkgname.desktop"
[Desktop Entry]
Name=$(cat package.json | grep productName | head -1 | awk -F: '{ print $2 }' | sed -E 's/^.?"//' | sed -E 's/",?$//')
Comment=$(cat package.json | grep description | head -1 | awk -F: '{ print $2 }' | sed -E 's/^.?"//' | sed -E 's/",?$//')
GenericName=Media Organizer
Exec=$pkgname
Icon=$pkgname
Type=Application
StartupNotify=true
Categories=Utility;Graphics;
EOF
  chmod +x "$pkgdir/usr/share/applications/$pkgname.desktop"
  touch "$pkgdir/usr/share/lintian/overrides/tagviewer"
  cp "resources/app/icons/png/1024x1024.png" "$pkgdir/usr/share/pixmaps/tagviewer.png"
  ln -s "$pkgdir/usr/lib/tagviewer/tagviewer" "$pkgdir/usr/bin/tagviewer"
}
