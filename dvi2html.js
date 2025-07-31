#!/usr/bin/env node

import fs from 'fs';
import { Writable } from 'stream';
import { dvi2html } from './dist/index.js';

const filename = process.argv[2];
const stream = fs.createReadStream(filename, { highWaterMark: 256 });

let svg = '';
const myWritable = new Writable({
    write(chunk, _encoding, callback) {
        svg += chunk.toString();
        callback();
    }
});

(async () => {
    await dvi2html(stream, myWritable);
    fs.writeFileSync(
        filename.replace(/\.dvi$/, '.html'),
        `<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DVI2HTML Testing ${filename.replace(/\.dvi$/, '')}</title>
        <link rel="stylesheet" href="fonts.css">
        <style>
            .svg-container {
                margin: 10px auto;
                width: -moz-fit-content;
                width: fit-content;
                height: -moz-fit-content;
                height: fit-content;
            }
            .svg-container svg { overflow: visible; }
        </style>
    </head>
    <body>
        <div class="svg-container">${svg}</div>
    </body>
</html>
`
    );
})();
