#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import desiredFonts from './fontlist.json' with { type: 'json' };

const outputPath = path.join(import.meta.dirname, '../src/tfm/fonts.json');

const fonts = {};

const processTfmFile = (fontname, filename) => {
    console.log(fontname, filename);

    const buffer = fs.readFileSync(filename);
    fonts[fontname] = buffer.toString('base64');
};

for (const fontname of Object.keys(desiredFonts)) {
    const filename = execSync(`kpsewhich ${fontname}.tfm`).toString().split('\n')[0];
    processTfmFile(fontname, filename);
}

const outputFile = fs.openSync(outputPath, 'w');
fs.writeFileSync(outputFile, JSON.stringify(fonts));
