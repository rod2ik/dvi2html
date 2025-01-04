import * as fs from 'fs';
import { execSync } from 'child_process';
import { dvi2html } from './src';
import { Writable } from 'stream';

let fonts = '';
fonts = fonts + `@font-face { font-family: esint10; src: url('./esint10.ttf'); }\n`;
fs.readdirSync('./bakoma/ttf').forEach((file) => {
    let name = file.replace(/.ttf/, '');
    fonts = fonts + `@font-face { font-family: ${name}; src: url('bakoma/ttf/${file}'); }\n`;
});
fs.writeFileSync('fonts.css', fonts);

//execSync("latex sample/sample.tex");

let filename = 'sample.dvi';

let stream = fs.createReadStream(filename, { highWaterMark: 256 });

let html = '';
html = html + '<!doctype html>\n';
html = html + '<html lang=en>\n';
html = html + '<head>\n';
html = html + '<link rel="stylesheet" type="text/css" href="fonts.css">\n';
html = html + '<link rel="stylesheet" type="text/css" href="base.css">\n';
html = html + '</head>\n';
html = html + '<body>\n';
html = html + '<div style="position: absolute;">\n';

//html = html + dviParser( buffer );

const myWritable = new Writable({
    write(chunk, encoding, callback) {
        html = html + chunk;
        callback();
    }
});

async function main() {
    await dvi2html(stream, myWritable);

    html = html + '</div>\n';
    html = html + '</body>\n';
    html = html + '</html>\n';

    fs.writeFileSync('index.html', html);
}

main();
console.log('DONE');
