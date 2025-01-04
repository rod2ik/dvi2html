import { Tfm } from './tfm/tfm';
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

export class DviFont {
    name: string;
    checksum: number;
    scaleFactor: number;
    designSize: number;
    metrics: Tfm;

    constructor(properties: DviFont) {
        this.name = properties.name;
        this.checksum = properties.checksum;
        this.scaleFactor = properties.scaleFactor;
        this.designSize = properties.designSize;
    }
}

export class Machine {
    fonts: DviFont[];
    font: DviFont;
    stack: Position[];
    position: Position;
    matrix: Matrix;

    constructor() {
        this.fonts = [];
        this.matrix = new Matrix();
    }

    preamble(_numerator: number, _denominator: number, _magnification: number, _comment: string) {}

    pushColor(_c: string) {}

    popColor() {}

    setPapersize(_width: number, _height: number) {}

    push() {
        this.stack.push(new Position(this.position));
    }

    pop() {
        this.position = this.stack.pop();
    }

    beginPage(_page: any) {
        this.stack = [];
        this.position = new Position();
    }

    endPage() {}

    post(_p: any) {}

    postPost(_p: any) {}

    getCurrentPosition(): [number, number] {
        return [this.position.h, this.position.v];
    }

    setCurrentPosition(x: number, y: number) {
        this.position.h = x;
        this.position.v = y;
    }

    putRule(_rule: Rule) {}

    moveRight(distance: number) {
        this.position.h += distance;
    }

    moveDown(distance: number) {
        this.position.v += distance;
    }

    setFont(font: DviFont) {
        this.font = font;
    }

    putSVG(_svg: string) {}

    putHTML(_html: string) {}

    // Returns the width of the text
    putText(_text: Buffer): number {
        return 0;
    }

    loadFont(properties: any): DviFont {
        const f = new DviFont(properties);
        f.metrics = loadFont(properties.name);
        return f;
    }
}
