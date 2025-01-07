# DVI Parser

This version of `dvi2html` is modified for the [`tikzjax`](https://github.com/drgrice1/tikzjax) project.

Note that the opentype bakoma fonts are used instead of the truetype fonts because of a glyph issue in the truetype
fonts. The unicode character `U+00AD` is used to index one of the glyphs in the truetype fonts. That is a soft hyphen
which is a character that browsers will not show even though that is not what the character is in the font. The opentype
bakoma fonts also have a glyph issue. They contain invalid out of range glyph indices. As such, to use them the invalid
glyphs need to be removed. This is done in the [`tikzjax`](https://github.com/drgrice1/tikzjax) project.

## Building

Run

```sh
npm install
npm run build
```

## General Project Comments

The original code in this project is based on code from the [PyDVI](https://github.com/FabriceSalvaire/PyDVI) and the
work of @tmanderson

The goal with this project is to eventually have a complete
[DVI](https://en.wikipedia.org/wiki/Device_independent_file_format) tool set written in node. Once complete, this will
hopefully be used to implement TeX document conversions completely in node (particularly a highly configurable
HTML/CSS/JS output).

There is a [DVI Specification Explained](https://github.com/tmanderson/dvi-parser/wiki/DVI-Specification-Explained)
section on the wiki of [tmanderson/dviparser](https://github.com/tmanderson) (sourced from a few different online
pages) for reference.

### TODO

- [x] DVI Parser
- [x] TFM Parser
- [x] Metric management (right now, fonts are found using `kpsewhich`)
- [x] HTML/CSS/JS conversion
