import { DviCommand, Special } from '../parser';
import { Machine } from '../machine';
import Matrix from '../matrix';

class PSFile extends DviCommand {
    ps: string;
    filename: string;

    constructor(ps: string) {
        super({});
        this.ps = ps;
    }

    execute(machine: Machine) {
        const filename = getAttribute(this.ps, 'psfile', '')?.replace(/\.eps$/, '');
        if (!filename) return;

        // Bounding box of image in PS point units (lower left and upper right corner)
        const llx = parseFloat(getAttribute(this.ps, 'llx', '0'));
        const lly = parseFloat(getAttribute(this.ps, 'lly', '0'));
        const urx = parseFloat(getAttribute(this.ps, 'urx', '0'));
        const ury = parseFloat(getAttribute(this.ps, 'ury', '0'));

        // Desired width and height of the untransformed figure in PS point units
        const rwi = parseFloat(getAttribute(this.ps, 'rwi', '-1')) / 10;
        const rhi = parseFloat(getAttribute(this.ps, 'rhi', '-1')) / 10;

        if (rwi == 0 || rhi == 0 || urx == llx || ury == lly) return;

        // User transformations (default values chosen according to dvips manual)
        // Order of transformations: rotate, scale, translate/offset
        const hoffset = parseFloat(getAttribute(this.ps, 'hoffset', '0'));
        const voffset = parseFloat(getAttribute(this.ps, 'voffset', '0'));
        const hscale = parseFloat(getAttribute(this.ps, 'hscale', '100'));
        const vscale = parseFloat(getAttribute(this.ps, 'vscale', '100'));
        const angle = parseFloat(getAttribute(this.ps, 'angle', '0'));

        let sx = rwi / Math.abs(llx - urx);
        let sy = rhi / Math.abs(lly - ury);

        if (sx == 0 || sy == 0) return;

        if (sx < 0) sx = sy; // rwi attribute not set
        if (sy < 0) sy = sx; // rhi attribute not set
        if (sx < 0) sx = sy = 1; // neither rwi nor rhi set

        const [x, y] = machine.getCurrentPosition();

        const matrix = new Matrix(machine.matrix);
        matrix
            .translate(x + hoffset, y - voffset)
            .scale(hscale / 100, vscale / 100)
            .rotate(-angle)
            .scale(sx, sy);

        // Move lower left corner of image to origin
        matrix.translate(-llx, -ury);

        machine.putSVG(
            `<image x="${llx}" y="${lly}" width="${urx}" height="${ury}" href="${filename}"` +
                `${matrix.toSVGTransform()}></image>`
        );
    }

    toString(): string {
        return `PSFile: ${this.ps}`;
    }
}

function getAttribute(input: string, attr: string, defaultValue: string): string {
    const strVal = input.match(RegExp(`${attr}="?(.*?)"?( |$)`, 'i'));
    if (strVal && strVal.length > 1) return strVal[1];
    return defaultValue;
}

export default async function* (commands: AsyncGenerator<DviCommand>) {
    for await (const command of commands) {
        if (command instanceof Special) {
            if (!/^psfile=/i.test(command.x)) {
                yield command;
            } else {
                yield new PSFile(command.x);
            }
        } else {
            yield command;
        }
    }
}
