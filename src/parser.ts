import { Buffer } from 'buffer';
import { Machine } from './machine';

enum Opcode {
    set_char = 0,
    set1 = 128,
    set2 = 129,
    set3 = 130,
    set4 = 131,
    set_rule = 132,
    put_char = 133,
    put2 = 134,
    put3 = 135,
    put4 = 136,
    put_rule = 137,
    nop = 138,
    bop = 139,
    eop = 140,
    push = 141,
    pop = 142,
    right = 143,
    right2 = 144,
    right3 = 145,
    right4 = 146,
    w = 147,
    w1 = 148,
    w2 = 149,
    w3 = 150,
    w4 = 151,
    x = 152,
    x1 = 153,
    x2 = 154,
    x3 = 155,
    x4 = 156,
    down = 157,
    down2 = 158,
    down3 = 159,
    down4 = 160,
    y = 161,
    y1 = 162,
    y2 = 163,
    y3 = 164,
    y4 = 165,
    z = 166,
    z1 = 167,
    z2 = 168,
    z3 = 169,
    z4 = 170,
    fnt = 171,
    fnt1 = 235,
    fnt2 = 236,
    fnt3 = 237,
    fnt4 = 238,
    xxx = 239,
    xxx2 = 240,
    xxx3 = 241,
    xxx4 = 242,
    fnt_def = 243,
    fnt_def2 = 244,
    fnt_def3 = 245,
    fnt_def4 = 246,
    pre = 247,
    post = 248,
    post_post = 249,
    post_post_repeats = 223
}

interface IDviCommand {
    length?: number;
}

export class DviCommand {
    length: number;

    constructor(properties: IDviCommand) {
        this.length = properties.length ?? 0;
    }

    execute(_machine: Machine) {}

    toString(): string {
        return 'DviCommand { }';
    }
}

// 133	put1	c[1]	typeset a character
// 134	put2	c[2]
// 135	put3	c[3]
// 136	put4	c[4]

interface IPutChar extends IDviCommand {
    c: number;
}

class PutChar extends DviCommand {
    opcode: Opcode.put_char = Opcode.put_char;
    c: number;
    constructor(properties: IPutChar) {
        super(properties);
        this.c = properties.c;
    }

    execute(machine: Machine) {
        machine.putText(Buffer.from([this.c]));
    }

    toString(): string {
        return `PutChar { c: '${String.fromCharCode(this.c)}' }`;
    }
}

// 0...127	set_char_i		typeset a character and move right
// 128	set1	c[1]	                typeset a character and move right
// 129	set2	c[2]
// 130	set3	c[3]
// 131	set4	c[4]

interface ISetChar extends IDviCommand {
    c: number;
}

class SetChar extends DviCommand {
    opcode: Opcode.set_char = Opcode.set_char;
    c: number;

    constructor(properties: ISetChar) {
        super(properties);
        this.c = properties.c;
    }

    execute(machine: Machine) {
        const text = Buffer.from([this.c]);
        const width = machine.putText(text);
        machine.moveRight(width);
    }

    toString(): string {
        return `SetChar { c: '${String.fromCharCode(this.c)}' }`;
    }
}

// This isn't a "real" command but rather a synthetic one
interface ISetText extends IDviCommand {
    t: Buffer;
}

class SetText extends DviCommand {
    t: Buffer;

    constructor(properties: ISetText) {
        super(properties);
        this.t = properties.t;
    }

    execute(machine: Machine) {
        const width = machine.putText(this.t);
        machine.moveRight(width);
    }

    toString() {
        return `SetText { t: "${this.t.toString()}" }`;
    }
}

// 137	put_rule	a[4], b[4]	typeset a rule

interface IPutRule extends IDviCommand {
    a: number;
    b: number;
}

class PutRule extends DviCommand {
    opcode: Opcode.put_rule = Opcode.put_rule;

    a: number;
    b: number;

    constructor(properties: IPutRule) {
        super(properties);
        this.a = properties.a;
        this.b = properties.b;
    }

    execute(machine: Machine) {
        machine.putRule(this);
    }

    toString(): string {
        return `PutRule { a: ${this.a}, b: ${this.b} }`;
    }
}

// 132	set_rule	a[4], b[4]	typeset a rule and move right

interface ISetRule extends IDviCommand {
    a: number;
    b: number;
}

class SetRule extends DviCommand {
    opcode: Opcode.set_rule = Opcode.set_rule;

    a: number;
    b: number;

    constructor(properties: ISetRule) {
        super(properties);
        this.a = properties.a;
        this.b = properties.b;
    }

    execute(machine: Machine) {
        machine.putRule(this);
        machine.moveRight(this.b);
    }

    toString(): string {
        return `SetRule { a: ${this.a}, b: ${this.b} }`;
    }
}

// 138	nop		no operation

class Nop extends DviCommand {
    opcode: Opcode.nop = Opcode.nop;

    constructor(properties: IDviCommand) {
        super(properties);
    }

    toString(): string {
        return `Nop { }`;
    }
}

// 139	bop	c_0[4]..c_9[4], p[4]	beginning of page
interface IBop extends IDviCommand {
    c_0: number;
    c_1: number;
    c_2: number;
    c_3: number;
    c_4: number;
    c_5: number;
    c_6: number;
    c_7: number;
    c_8: number;
    c_9: number;
    p: number;
}

class Bop extends DviCommand {
    opcode: Opcode.bop = Opcode.bop;
    c_0: number;
    c_1: number;
    c_2: number;
    c_3: number;
    c_4: number;
    c_5: number;
    c_6: number;
    c_7: number;
    c_8: number;
    c_9: number;
    p: number;

    constructor(properties: IBop) {
        super(properties);
        this.c_0 = properties.c_0;
        this.c_1 = properties.c_1;
        this.c_2 = properties.c_2;
        this.c_3 = properties.c_3;
        this.c_4 = properties.c_4;
        this.c_5 = properties.c_5;
        this.c_6 = properties.c_6;
        this.c_7 = properties.c_7;
        this.c_8 = properties.c_8;
        this.c_9 = properties.c_9;
        this.p = properties.p;
    }

    execute(machine: Machine) {
        machine.beginPage(this);
    }

    toString(): string {
        return `Bop { ... }`;
    }
}

// 140	eop		ending of page

class Eop extends DviCommand {
    opcode: Opcode.eop = Opcode.eop;

    constructor(properties: IDviCommand) {
        super(properties);
    }

    execute(machine: Machine) {
        if (machine.stack.length) throw new Error('Stack should be empty at the end of a page.');

        machine.endPage();
    }

    toString(): string {
        return `Eop { }`;
    }
}

// 141	push		save the current positions

class Push extends DviCommand {
    opcode: Opcode.push = Opcode.push;

    constructor(properties: IDviCommand) {
        super(properties);
    }

    execute(machine: Machine) {
        machine.push();
    }

    toString(): string {
        return `Push { }`;
    }
}

// 142	pop		restore previous positions

class Pop extends DviCommand {
    opcode: Opcode.pop = Opcode.pop;

    constructor(properties: IDviCommand) {
        super(properties);
    }

    execute(machine: Machine) {
        machine.pop();
    }

    toString(): string {
        return `Pop { }`;
    }
}

// 143	right1	b[1]	move right
// 144	right2	b[2]
// 145	right3	b[3]
// 146	right4	b[4]
interface IMoveRight extends IDviCommand {
    b: number;
}

class MoveRight extends DviCommand {
    opcode: Opcode.right = Opcode.right;
    b: number;
    constructor(properties: IMoveRight) {
        super(properties);
        this.b = properties.b;
    }

    execute(machine: Machine) {
        machine.moveRight(this.b);
    }

    toString(): string {
        return `MoveRight { b: ${this.b} }`;
    }
}

// 147	w0		move right by w
// 148	w1	b[1]	move right and set w
// 149	w2	b[2]
// 150	w3	b[3]
// 151	w4	b[4]
interface IMoveW extends IDviCommand {
    b: number;
}

class MoveW extends DviCommand {
    opcode: Opcode.w = Opcode.w;
    b: number;
    constructor(properties: IMoveW) {
        super(properties);
        this.b = properties.b;
    }

    execute(machine: Machine) {
        if (this.length > 1) machine.position.w = this.b;
        machine.moveRight(machine.position.w);
    }

    toString(): string {
        if (this.length > 1) return `MoveW { b: ${this.b} }`;
        else return `MoveW0 { }`;
    }
}

// 152	x0		move right by x
// 153	x1	b[1]	move right and set x
// 154	x2	b[2]
// 155	x3	b[3]
// 156	x4	b[4]
interface IMoveX extends IDviCommand {
    b: number;
}

class MoveX extends DviCommand {
    opcode: Opcode.x = Opcode.x;
    b: number;
    constructor(properties: IMoveX) {
        super(properties);
        this.b = properties.b;
    }

    execute(machine: Machine) {
        if (this.length > 1) machine.position.x = this.b;
        machine.moveRight(machine.position.x);
    }

    toString(): string {
        if (this.length > 1) return `MoveX { b: ${this.b} }`;
        else return `MoveX0 { }`;
    }
}

// 157	down1	a[1]	move down
// 158	down2	a[2]
// 159	down3	a[3]
// 160	down4	a[4]
interface IMoveDown extends IDviCommand {
    a: number;
}

class MoveDown extends DviCommand {
    opcode: Opcode.down = Opcode.down;
    a: number;
    constructor(properties: IMoveDown) {
        super(properties);
        this.a = properties.a;
    }

    execute(machine: Machine) {
        machine.moveDown(this.a);
    }

    toString(): string {
        return `MoveDown { a: ${this.a} }`;
    }
}

// 161	y0		move down by y
// 162	y1	a[1]	move down and set y
// 163	y2	a[2]
// 164	y3	a[3]
// 165	y4	a[4]
interface IMoveY extends IDviCommand {
    a: number;
}

class MoveY extends DviCommand {
    opcode: Opcode.y = Opcode.y;
    a: number;
    constructor(properties: IMoveY) {
        super(properties);
        this.a = properties.a;
    }

    execute(machine: Machine) {
        if (this.length > 1) machine.position.y = this.a;
        machine.moveDown(machine.position.y);
    }

    toString(): string {
        if (this.length > 1) return `MoveY { a: ${this.a} }`;
        else return `MoveY0 { }`;
    }
}

// 166	z0		move down by z
// 167	z1	a[1]	move down and set z
// 168	z2	a[2]
// 169	z3	a[3]
// 170	z4	a[4]
interface IMoveZ extends IDviCommand {
    a: number;
}

class MoveZ extends DviCommand {
    opcode: Opcode.z = Opcode.z;
    a: number;

    constructor(properties: IMoveZ) {
        super(properties);
        this.a = properties.a;
    }

    execute(machine: Machine) {
        if (this.length > 1) machine.position.z = this.a;
        machine.moveDown(machine.position.z);
    }

    toString(): string {
        if (this.length > 1) return `MoveZ { a: ${this.a} }`;
        else return `MoveZ0 { }`;
    }
}

// 171...234	fnt_num_i		set current font to i
// 235	fnt1	k[1]	set current font
// 236	fnt2	k[2]
// 237	fnt3	k[3]
// 238	fnt4	k[4]
interface ISetFont extends IDviCommand {
    k: number;
}

class SetFont extends DviCommand {
    opcode: Opcode.fnt = Opcode.fnt;
    k: number;

    constructor(properties: ISetFont) {
        super(properties);
        this.k = properties.k;
    }

    execute(machine: Machine) {
        if (machine.fonts[this.k]) {
            machine.setFont(machine.fonts[this.k]);
        } else throw new Error(`Could not find font ${this.k}.`);
    }

    toString(): string {
        return `SetFont { k: ${this.k} }`;
    }
}

// 239	xxx1	k[1], x[k]	extension to DVI primitives
// 240	xxx2	k[2], x[k]
// 241	xxx3	k[3], x[k]
// 242	xxx4	k[4], x[k]
interface ISpecial extends IDviCommand {
    x: string;
}

export class Special extends DviCommand {
    opcode: Opcode.xxx = Opcode.xxx;
    x: string;

    constructor(properties: ISpecial) {
        super(properties);
        this.x = properties.x;
    }

    toString(): string {
        return `Special { x: '${this.x}' }`;
    }
}

// 243	fnt_def1	k[1], c[4], s[4], d[4],
// a[1], l[1], n[a+l]	define the meaning of a font number
// 244	fnt_def2	k[2], c[4], s[4], d[4],
// a[1], l[1], n[a+l]
// 245	fnt_def3	k[3], c[4], s[4], d[4],
// a[1], l[1], n[a+l]
// 246	fnt_def4	k[4], c[4], s[4], d[4],
// a[1], l[1], n[a+l]

interface IFontDefinition extends IDviCommand {
    k: number; // font id
    c: number; // checksum
    s: number; // fixed-point scale factor (applied to char widths of font)
    d: number; // design-size factors with the magnification (`s/1000`)
    a: number; // length of directory path of font (`./` if a = 0)
    l: number; // length of font name
    n: string; // font name (first `a` bytes is dir, remaining `l` = name)
}

class FontDefinition extends DviCommand {
    opcode: Opcode.fnt_def = Opcode.fnt_def;
    k: number; // font id
    c: number; // checksum
    s: number; // fixed-point scale factor (applied to char widths of font)
    d: number; // design-size factors with the magnification (`s/1000`)
    a: number; // length of directory path of font (`./` if a = 0)
    l: number; // length of font name
    n: string; // font name (first `a` bytes is dir, remaining `l` = name)

    constructor(properties: IFontDefinition) {
        super(properties);
        this.k = properties.k;
        this.c = properties.c;
        this.s = properties.s;
        this.d = properties.d;
        this.a = properties.a;
        this.l = properties.l;
        this.n = properties.n;
    }

    execute(machine: Machine) {
        machine.fonts[this.k] = machine.loadFont({
            name: this.n,
            checksum: this.c,
            scaleFactor: this.s,
            designSize: this.d
        });
    }

    toString(): string {
        return `FontDefinition { k: ${this.k}, n: '${this.n}', ... }`;
    }
}

// 247	pre	i[1], num[4], den[4], mag[4],  k[1], x[k]	preamble
interface IPreamble extends IDviCommand {
    i: number;
    num: number;
    den: number;
    mag: number;
    x: string;
}
class Preamble extends DviCommand {
    opcode: Opcode.pre = Opcode.pre;

    i: number;
    num: number;
    den: number;
    mag: number;
    x: string;

    constructor(properties: IPreamble) {
        super(properties);
        this.i = properties.i;
        this.x = properties.x;
        this.num = properties.num;
        this.den = properties.den;
        this.mag = properties.mag;
    }

    execute(machine: Machine) {
        if (this.num <= 0) throw new Error('Invalid numerator (must be > 0)');

        if (this.den <= 0) throw new Error('Invalid denominator (must be > 0)');

        if (this.i != 2) {
            throw new Error('DVI format must be 2.');
        }

        machine.preamble(this.num, this.den, this.mag, this.x);
    }

    toString(): string {
        return `Preamble { i: ${this.i}, num: ${this.num}, den: ${this.den}, mag: ${this.mag}, x: '${this.x}' }`;
    }
}

// 248	post	p[4], num[4], den[4], mag[4], l[4], u[4], s[2], t[2]
// < font definitions >	postamble beginning
interface IPost extends IDviCommand {
    p: number;
    num: number;
    den: number;
    mag: number;
    l: number;
    u: number;
    s: number;
    t: number;
}

class Post extends DviCommand {
    opcode: Opcode.post = Opcode.post;

    p: number;
    num: number;
    den: number;
    mag: number;
    l: number;
    u: number;
    s: number;
    t: number;

    constructor(properties: IPost) {
        super(properties);
        this.p = properties.p;
        this.num = properties.num;
        this.den = properties.den;
        this.mag = properties.mag;
        this.l = properties.l;
        this.u = properties.u;
        this.s = properties.s;
        this.t = properties.t;
    }

    execute(machine: Machine) {
        machine.post(this);
    }

    toString(): string {
        return `Post { p: ${this.p}, num: ${this.num}, den: ${this.den}, mag: ${this.mag}, ... }`;
    }
}

// 249	post_post	q[4], i[1]; 223's	postamble ending
interface IPostPost extends IDviCommand {
    q: number;
    i: number;
}

class PostPost extends DviCommand {
    opcode: Opcode.post_post = Opcode.post_post;

    q: number;
    i: number;

    constructor(properties: IPostPost) {
        super(properties);
        this.q = properties.q;
        this.i = properties.i;
    }

    execute(machine: Machine) {
        machine.postPost(this);
    }

    toString(): string {
        return `PostPost { q: ${this.q}, i: ${this.i} }`;
    }
}

// 250...255	undefined

// cat src/parser.ts | grep interface | sed 's/interface //g' | tr -d ' {' | tr '\n' '|' | sed 's/|/ | /g' | xsel -b

type Command =
    | SetChar
    | SetRule
    | PutChar
    | PutRule
    | Nop
    | Bop
    | Eop
    | Push
    | Pop
    | MoveRight
    | MoveW
    | MoveX
    | MoveDown
    | MoveY
    | MoveZ
    | SetFont
    | Special
    | FontDefinition
    | Preamble
    | Post
    | PostPost;

function parseCommand(opcode: Opcode, buffer: Buffer): Command | void {
    if (opcode >= Opcode.set_char && opcode < Opcode.set1) {
        return new SetChar({ c: opcode, length: 1 });
    }

    if (opcode >= Opcode.fnt && opcode < Opcode.fnt1) return new SetFont({ k: opcode - 171, length: 1 });

    // Technically these are undefined opcodes, but we'll pretend they are NOPs
    if (opcode >= 250 && opcode <= 255) {
        throw Error(`Undefined opcode ${opcode}`);
    }

    switch (opcode) {
        case Opcode.set1:
        case Opcode.set2:
        case Opcode.set3:
        case Opcode.set4:
            if (buffer.length < opcode - Opcode.set1 + 1) return undefined;
            return new SetChar({
                c: buffer.readUIntBE(0, opcode - Opcode.set1 + 1),
                length: opcode - Opcode.set1 + 1 + 1
            });

        case Opcode.set_rule:
            if (buffer.length < 8) return undefined;
            return new SetRule({
                a: buffer.readInt32BE(0),
                b: buffer.readInt32BE(4),
                length: 9
            });

        case Opcode.put_char:
        case Opcode.put2:
        case Opcode.put3:
        case Opcode.put4:
            if (buffer.length < opcode - Opcode.put_char + 1) return undefined;
            return new PutChar({
                c: buffer.readIntBE(0, opcode - Opcode.put_char + 1),
                length: opcode - Opcode.put_char + 1 + 1
            });

        case Opcode.put_rule:
            if (buffer.length < 8) return undefined;
            return new PutRule({
                a: buffer.readInt32BE(0),
                b: buffer.readInt32BE(4),
                length: 9
            });

        case Opcode.nop:
            return new Nop({ length: 1 });

        case Opcode.bop:
            if (buffer.length < 44) return undefined;
            return new Bop({
                c_0: buffer.readUInt32BE(0),
                c_1: buffer.readUInt32BE(4),
                c_2: buffer.readUInt32BE(8),
                c_3: buffer.readUInt32BE(12),
                c_4: buffer.readUInt32BE(16),
                c_5: buffer.readUInt32BE(20),
                c_6: buffer.readUInt32BE(24),
                c_7: buffer.readUInt32BE(28),
                c_8: buffer.readUInt32BE(32),
                c_9: buffer.readUInt32BE(36),
                p: buffer.readUInt32BE(40),
                length: 45
            });

        case Opcode.eop:
            return new Eop({ length: 1 });

        case Opcode.push:
            return new Push({ length: 1 });

        case Opcode.pop:
            return new Pop({ length: 1 });

        case Opcode.right:
        case Opcode.right2:
        case Opcode.right3:
        case Opcode.right4:
            if (buffer.length < opcode - Opcode.right + 1) return undefined;
            return new MoveRight({
                b: buffer.readIntBE(0, opcode - Opcode.right + 1),
                length: opcode - Opcode.right + 1 + 1
            });

        case Opcode.w:
            return new MoveW({ b: 0, length: 1 });

        case Opcode.w1:
        case Opcode.w2:
        case Opcode.w3:
        case Opcode.w4:
            if (buffer.length < opcode - Opcode.w) return undefined;
            return new MoveW({
                b: buffer.readIntBE(0, opcode - Opcode.w),
                length: opcode - Opcode.w + 1
            });

        case Opcode.x:
            return new MoveX({ b: 0, length: 1 });

        case Opcode.x1:
        case Opcode.x2:
        case Opcode.x3:
        case Opcode.x4:
            if (buffer.length < opcode - Opcode.x) return undefined;
            return new MoveX({
                b: buffer.readIntBE(0, opcode - Opcode.x),
                length: opcode - Opcode.x + 1
            });

        case Opcode.down:
        case Opcode.down2:
        case Opcode.down3:
        case Opcode.down4:
            if (buffer.length < opcode - Opcode.down + 1) return undefined;
            return new MoveDown({
                a: buffer.readIntBE(0, opcode - Opcode.down + 1),
                length: opcode - Opcode.down + 1 + 1
            });

        case Opcode.y:
            return new MoveY({ a: 0, length: 1 });

        case Opcode.y1:
        case Opcode.y2:
        case Opcode.y3:
        case Opcode.y4:
            if (buffer.length < opcode - Opcode.y) return undefined;
            return new MoveY({
                a: buffer.readIntBE(0, opcode - Opcode.y),
                length: opcode - Opcode.y + 1
            });

        case Opcode.z:
            return new MoveZ({ a: 0, length: 1 });

        case Opcode.z1:
        case Opcode.z2:
        case Opcode.z3:
        case Opcode.z4:
            if (buffer.length < opcode - Opcode.z) return undefined;
            return new MoveZ({
                a: buffer.readIntBE(0, opcode - Opcode.z),
                length: opcode - Opcode.z + 1
            });

        case Opcode.fnt1:
        case Opcode.fnt2:
        case Opcode.fnt3:
        case Opcode.fnt4:
            if (buffer.length < opcode - Opcode.fnt1 + 1) return undefined;
            return new SetFont({
                k: buffer.readIntBE(0, opcode - Opcode.fnt1 + 1),
                length: opcode - Opcode.fnt1 + 1 + 1
            });

        case Opcode.xxx:
        case Opcode.xxx2:
        case Opcode.xxx3:
        case Opcode.xxx4: {
            const i = opcode - Opcode.xxx + 1;
            if (buffer.length < i) return undefined;
            const k = buffer.readUIntBE(0, i);
            if (buffer.length < i + k) return undefined;
            return new Special({
                x: buffer.subarray(i, i + k).toString(),
                length: i + k + 1
            });
        }

        case Opcode.fnt_def:
        case Opcode.fnt_def2:
        case Opcode.fnt_def3:
        case Opcode.fnt_def4: {
            const i = opcode - Opcode.fnt_def + 1;
            if (buffer.length < i) return undefined;
            const k = buffer.readIntBE(0, i);
            if (buffer.length < i + 14) return undefined;
            const c = buffer.readUInt32BE(i + 0);
            const s = buffer.readUInt32BE(i + 4);
            const d = buffer.readUInt32BE(i + 8);
            const a = buffer.readUInt8(i + 12);
            const l = buffer.readUInt8(i + 13);
            if (buffer.length < i + 14 + a + l) return undefined;
            const n = buffer.subarray(i + 14, i + 14 + a + l).toString();
            return new FontDefinition({
                k: k,
                c: c,
                s: s,
                d: d,
                a: a,
                l: l,
                n: n,
                length: i + 14 + a + l + 1
            });
        }

        case Opcode.pre: {
            if (buffer.length < 14) return undefined;
            const i = buffer.readUInt8(0);
            const num = buffer.readUInt32BE(1);
            const den = buffer.readUInt32BE(5);
            const mag = buffer.readUInt32BE(9);
            const k = buffer.readUInt8(13);
            if (buffer.length < 14 + k) return undefined;

            return new Preamble({
                i: i,
                num: num,
                den: den,
                mag: mag,
                x: buffer.subarray(14, 14 + k).toString(),
                length: 14 + k + 1
            });
        }

        case Opcode.post:
            if (buffer.length < 4 + 4 + 4 + 4 + 4 + 4 + 2 + 2) return undefined;
            return new Post({
                p: buffer.readUInt32BE(0),
                num: buffer.readUInt32BE(4),
                den: buffer.readUInt32BE(8),
                mag: buffer.readUInt32BE(12),
                l: buffer.readUInt32BE(16),
                u: buffer.readUInt32BE(20),
                s: buffer.readUInt16BE(24),
                t: buffer.readUInt16BE(26),
                length: 29
            });

        case Opcode.post_post:
            if (buffer.length < 5) return undefined;
            return new PostPost({
                q: buffer.readUInt32BE(0),
                i: buffer.readUInt8(4),
                length: 6
            });
    }

    return undefined;
}

export async function* dviParser(stream: AsyncGenerator<Buffer>) {
    let buffer = Buffer.alloc(0);
    let isAfterPostamble = false;

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
        let offset = 0;

        while (offset < buffer.length) {
            const opcode: Opcode = buffer.readUInt8(offset);

            if (isAfterPostamble) {
                if (opcode == 223) {
                    offset++;
                    continue;
                } else {
                    throw new Error('Only 223 bytes are permitted after the post-postamble.');
                }
            }

            const command = parseCommand(opcode, buffer.subarray(offset + 1));

            if (command) {
                yield command;
                offset += command.length;

                if (command.opcode == Opcode.post_post) isAfterPostamble = true;
            } else break;
        }

        buffer = buffer.subarray(offset);
    }
}

export async function execute(commands: AsyncGenerator<DviCommand>, machine: Machine) {
    for await (const command of commands) {
        command.execute(machine);
    }
}

export async function* merge<T extends DviCommand>(
    commands: AsyncGenerator<DviCommand>,
    filter: (command: DviCommand) => boolean,
    merge: (queue: T[]) => Generator<DviCommand>
) {
    let queue: T[] = [];

    for await (const command of commands) {
        if (filter(command)) {
            queue.push(command as T);
        } else {
            if (queue.length > 0) {
                yield* merge(queue);
                queue = [];
            }

            yield command;
        }
    }

    if (queue.length > 0) yield* merge(queue);
}

export function mergeText(commands: AsyncGenerator<DviCommand>) {
    return merge(
        commands,
        (command) => command instanceof SetChar,
        function* (queue: SetChar[]) {
            yield new SetText({ t: Buffer.from(queue.map((command) => command.c)) });
        }
    );
}
