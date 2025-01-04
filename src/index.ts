import type { Writable } from 'stream';
import color from './specials/color';
import svg from './specials/svg';
import ps from './specials/ps';
import psFile from './specials/psfile';
//import html from "./specials/html";
import papersize from './specials/papersize';

import HTMLMachine from './html';
import TextMachine from './text';

export const Machines = { HTML: HTMLMachine, text: TextMachine };

import { dviParser, execute, mergeText } from './parser';
export { dviParser, execute, mergeText };

export const specials = {
    color: color,
    svg: svg,
    // html: html,
    papersize: papersize
};

export async function dvi2html(dviStream: AsyncGenerator<Buffer>, htmlStream: Writable) {
    const parser = papersize(svg(psFile(ps(color(mergeText(dviParser(dviStream)))))));

    const machine = new HTMLMachine(htmlStream);

    await execute(parser, machine);

    return machine;
}

import { tfmData } from './tfm/index';
export { tfmData };
