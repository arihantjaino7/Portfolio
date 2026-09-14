#!/usr/bin/env bash
# Registers the site's webfonts with fontconfig so scripts/gen-assets.mjs can
# render OG cards in the real typefaces instead of a fallback.
set -euo pipefail
mkdir -p "$HOME/.local/share/fonts"
node -e "
const w=require('wawoff2'), fs=require('fs');
(async()=>{for(const [s,d] of [
  ['public/fonts/archivo-latin-wght-normal.woff2','Archivo.ttf'],
  ['public/fonts/jetbrains-mono-latin-wght-normal.woff2','JetBrainsMono.ttf']]){
  fs.writeFileSync(process.env.HOME+'/.local/share/fonts/'+d, Buffer.from(await w.decompress(fs.readFileSync(s))));
}})();"
fc-cache -f >/dev/null
echo "fonts registered"
