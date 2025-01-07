#!/usr/bin/env node

import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

import desiredFonts from '../src/tfm/fontlist.json' with { type: 'json' };

const kpsewhich = (s) =>
    new Promise((resolve, reject) => {
        execFile('kpsewhich', [s], (error, stdout, _stderr) => {
            if (error) reject(error);
            else resolve(stdout.trim());
        });
    });

const loadGlyphList = async (s) => {
    const filename = await kpsewhich(s);
    const list = (await fs.readFile(filename)).toString();

    const result = {};

    for (const line of list.split('\n')) {
        const parts = line.replace(/#.*/, '').split(';');
        if (parts.length >= 2) {
            result[parts[0]] = Math.min(
                ...parts[1]
                    .split(',')
                    .filter((e) => e.length == 4)
                    .map((e) => parseInt(e, 16))
            );
        }
    }
    return result;
};

const loadAllGlyphs = async () => {
    const glyphs1 = await loadGlyphList('glyphlist.txt');
    const glyphs2 = await loadGlyphList('texglyphlist.txt');
    Object.assign(glyphs1, glyphs2);

    glyphs1['suppress'] = 0;
    glyphs1['mapsto'] = 0x21a6;
    glyphs1['arrowhookleft'] = 0x21a9;
    glyphs1['arrowhookright'] = 0x21aa;
    glyphs1['tie'] = 0x2040;
    return glyphs1;
};

function* tokenize(chars) {
    const iterator = chars[Symbol.iterator]();
    let ch = getNextItem(iterator);
    do {
        if (ch === '%') {
            do {
                ch = getNextItem(iterator);
            } while (ch !== '\n');
        }
        if (typeof ch === 'string' && /^[[\]{}]$/.test(ch)) {
            yield ch;
        } else if (ch == '/' || isWordChar(ch)) {
            let word = '';
            do {
                word += ch;
                ch = getNextItem(iterator);
            } while (isWordChar(ch));
            yield word;
            continue;
        }
        ch = getNextItem(iterator);
        // Ignore all other characters
    } while (ch !== END_OF_SEQUENCE);
}

const END_OF_SEQUENCE = Symbol();

const getNextItem = (iterator) => {
    const item = iterator.next();
    return item.done ? END_OF_SEQUENCE : item.value;
};

const isWordChar = (ch) => typeof ch === 'string' && /^[.A-Za-z0-9]$/.test(ch);

const glyphToCodepoint = (glyphs, name) => {
    if (typeof glyphs[name] === 'number') return glyphs[name];
    if (name === '.notdef') return 0;
    if (/^u[0-9A-Fa-f]+$/.test(name)) return parseInt(name.slice(1), 16);
    throw `${name} is not a glyphname`;
};

const execute = (token, stack, state, table, glyphs) => {
    if (token == 'repeat') {
        const code = stack.pop();
        const count = stack.pop();
        for (let i = 0; i < count; i++) {
            for (const c of code) {
                execute(c, stack, state, table, glyphs);
            }
        }
        return;
    }

    if (token[0] == '}') {
        state.brace = false;
        return;
    }

    if (state.brace) {
        stack[stack.length - 1].push(token);
        return;
    }

    if (token[0] == '{') {
        state.brace = true;
        stack.push([]);
        return;
    }

    if (token[0] == '[') {
        state.bracket = true;
        return;
    }

    if (token[0] == ']') {
        state.bracket = false;
        return;
    }

    if (token[0] == '/') {
        if (state.bracket) table.push(glyphToCodepoint(glyphs, token.slice(1)));
        stack.push(token);
        return;
    }

    if (/^[0-9]+$/.test(token)) {
        stack.push(parseInt(token));
        return;
    }
};

const loadEncoding = async (s, glyphs) => {
    const filename = await kpsewhich(s);
    const encoding = (await fs.readFile(filename)).toString();
    const stack = [];
    const state = {};
    const table = [];
    for (const token of tokenize(encoding)) {
        execute(token, stack, state, table, glyphs);
    }
    return new Uint16Array(table);
};

(async () => {
    const glyphs = await loadAllGlyphs();
    const tables = {};

    const encodings = Object.values(desiredFonts).filter((value, index, self) => self.indexOf(value) === index);
    for (const encoding of encodings) {
        console.log(`Processing ${encoding}...`);
        if (encoding === 'cmex') {
            tables.cmex = {};
            for (let c = 0; c < 256; ++c) {
                tables.cmex[c.toString()] =
                    c >= 0 && c <= 9 ? c + 61601 : c >= 10 && c <= 32 ? c + 61603 : c == 127 ? 61636 : c + 61440;
            }
        } else {
            const table = await loadEncoding(encoding + '.enc', glyphs);
            if (table.length != 256) throw `Expected 256 codepoints but received ${table.length}`;
            tables[encoding] = table;
        }
    }

    const outputPath = path.join(import.meta.dirname, '../src/tfm/encodings.json');
    const outputFile = await fs.open(outputPath, 'w');
    await fs.writeFile(outputFile, JSON.stringify(tables));
})();
