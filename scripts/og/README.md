# OG image assets

Source assets for the site's Open Graph cover image (`static/og-cover.png`).

## Files

- `Audiowide-Regular.ttf` — the brand wordmark font, downloaded from Google Fonts.
  Licensed under the SIL Open Font License 1.1; see `OFL.txt`.
- `OFL.txt` — the SIL Open Font License text. Required to ship with the font.

## Regenerating `static/og-cover.png`

The current PNG was rendered from `static/og-cover.svg`, which is self-contained
(the font is embedded as a base64 data URI inside the SVG). To regenerate:

```bash
rsvg-convert -w 1200 -h 630 static/og-cover.svg -o static/og-cover.png
```

`rsvg-convert` resolves the embedded font on its own — no need to install the
TTF system-wide. If you'd rather edit the SVG without the inline font, use
the TTF in this directory as a system font instead:

```bash
# macOS
cp scripts/og/Audiowide-Regular.ttf ~/Library/Fonts/

# Linux
mkdir -p ~/.fonts && cp scripts/og/Audiowide-Regular.ttf ~/.fonts/ && fc-cache -f
```

## Why this lives in `scripts/`, not `static/`

The TTF and license are build-time / source assets, not files we want served
at `https://www.octopunk.io/...`. Only the rendered `og-cover.png` (plus the
optional `og-cover.svg` source) lives in `static/`.
