#!/usr/bin/env bash
set -euo pipefail
if [[ "$(uname -s)" != "Linux" ]]; then echo "Linux only" >&2; exit 1; fi
arch="$(node -p 'process.arch')"
target="vendor/tools/linux/$arch"
mkdir -p "$target/tessdata" "$target/lib"
for cmd in pdftotext pdftoppm tesseract; do
  binary="$(command -v "$cmd" || true)"
  if [[ -z "$binary" ]]; then echo "Missing build-time tool: $cmd" >&2; exit 1; fi
  cp -L "$binary" "$target/$cmd"
  chmod +x "$target/$cmd"
  ldd "$binary" | awk '/=> \/[^ ]+/ {print $3} /^\s*\/[^ ]+/ {print $1}' | while read -r lib; do
    [[ -f "$lib" ]] && cp -L -n "$lib" "$target/lib/" || true
  done
done
for lang in deu eng; do
  found=""
  for root in /usr/share/tesseract-ocr/5/tessdata /usr/share/tesseract-ocr/4.00/tessdata /usr/share/tessdata; do
    if [[ -f "$root/$lang.traineddata" ]]; then found="$root/$lang.traineddata"; break; fi
  done
  if [[ -z "$found" ]]; then echo "Missing build-time language: $lang" >&2; exit 1; fi
  cp "$found" "$target/tessdata/$lang.traineddata"
done
echo "Linux OCR executables and language packs staged in $target"
echo "NOTE: runtime dependencies and license compliance must be independently verified."
