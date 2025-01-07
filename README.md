# DVI Parser

This version of `dvi2html` is modified for the [`tikzjax`](https://github.com/drgrice1/tikzjax) project.

Note that the opentype cmex bakoma fonts are used instead of the truetype fonts because of a glyph issue in the truetype
fonts. The glyph for the angbracketleftbig character in the truetype cmex fonts is a soft hyphen which is a character
that browsers will not show. The opentype bakoma fonts also have a glyph issue. They contain invalid out of range glyph
indices. As such, to use them the invalid glyphs need to be removed. This is done in the
[`tikzjax`](https://github.com/drgrice1/tikzjax) project.

## Building

Run

```sh
npm install
npm run build
```

## General Project Comments

Built using [PyDVI](https://github.com/FabriceSalvaire/PyDVI) and the work of @tmanderson

The goal with this project is to eventually have a complete
[DVI](https://en.wikipedia.org/wiki/Device_independent_file_format) toolset written in node. Once complete, this will
hopefully be used to implement TeX document conversions completely in node (particularly a highly configurable
HTML/CSS/JS output).

I'll also be updating the Wiki for those that are interested. Currently, I there's a [DVI Specification
Explained](https://github.com/tmanderson/dvi-parser/wiki/DVI-Specification-Explained) section that I put together for my
own benefit (sourced from a few different online pages).

### TODO

- [x] DVI Parser
- [x] TFM Parser
- [x] Metric management (right now, fonts are found using `kpsewhich`)
- [x] HTML/CSS/JS conversion
