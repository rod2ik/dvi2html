import type { Buffer } from 'buffer';
import type { Tfm } from './tfm/tfm';
import { loadFont } from './tfm/index';
import Matrix from './matrix';

export interface Rule {
    a: number;
    b: number;
}

class Position {
    h: number;
    v: number;
    w: number;
    x: number;
    y: number;
    z: number;

    constructor(properties?: Position) {
        if (properties) {
            this.h = properties.h;
            this.v = properties.v;
            this.w = properties.w;
            this.x = properties.x;
            this.y = properties.y;
            this.z = properties.z;
        } else {
            this.h = this.v = this.w = this.x = this.y = this.z = 0;
        }
    }
}

interface DviFontProperties {
    name: string;
    checksum: number;
    scaleFactor: number;
    designSize: number;
}

export class DviFont {
    name: string;
    checksum: number;
    scaleFactor: number;
    designSize: number;
    metrics!: Tfm;

    constructor(properties: DviFontProperties) {
        this.name = properties.name;
        this.checksum = properties.checksum;
        this.scaleFactor = properties.scaleFactor;
        this.designSize = properties.designSize;
    }
}

export class Machine {
    fonts: DviFont[];
    font!: DviFont;
    stack: Position[] = [];
    position: Position = new Position();
    matrix: Matrix;

    constructor() {
        this.fonts = [];
        this.matrix = new Matrix();
    }

    preamble(_numerator: number, _denominator: number, _magnification: number, _comment: string) {
        /* ignore */
    }

    pushColor(_c: string) {
        /* ignore */
    }

    popColor() {
        /* ignore */
    }

    setPapersize(_width: number, _height: number) {
        /* ignore */
    }

    push() {
        this.stack.push(new Position(this.position));
    }

    pop() {
        const last = this.stack.pop();
        if (!last) throw new Error('Attempted to pop from empty position stack');
        this.position = last;
    }

    beginPage(_page: unknown) {
        this.stack = [];
        this.position = new Position();
    }

    endPage() {
        /* ignore */
    }

    post(_p: unknown) {
        /* ignore */
    }

    postPost(_p: unknown) {
        /* ignore */
    }

    getCurrentPosition(): [number, number] {
        return [this.position.h, this.position.v];
    }

    setCurrentPosition(x: number, y: number) {
        this.position.h = x;
        this.position.v = y;
    }

    putRule(_rule: Rule) {
        /* ignore */
    }

    moveRight(distance: number) {
        this.position.h += distance;
    }

    moveDown(distance: number) {
        this.position.v += distance;
    }

    setFont(font: DviFont) {
        this.font = font;
    }

    putSVG(_svg: string) {
        /* ignore */
    }

    putHTML(_html: string) {
        /* ignore */
    }

    // Returns the width of the text
    putText(_text: Buffer): number {
        return 0;
    }

    loadFont(properties: DviFontProperties): DviFont {
        const f = new DviFont(properties);
        f.metrics = loadFont(properties.name);
        return f;
    }
}
