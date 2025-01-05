import { DviCommand, Special } from '../parser';
import type { Machine } from '../machine';

class Papersize extends DviCommand {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        super({});
        this.width = width;
        this.height = height;
    }

    execute(machine: Machine) {
        machine.setPapersize(this.width, this.height);
    }

    toString(): string {
        return `Papersize { width: ${this.width.toString()}, height: ${this.height.toString()} }`;
    }
}

export default async function* (commands: AsyncGenerator<DviCommand>) {
    for await (const command of commands) {
        if (command instanceof Special && command.x.startsWith('papersize=')) {
            const sizes = command.x.replace(/^papersize=/, '').split(',');

            if (sizes.length != 2) throw new Error('Papersize special requires two arguments.');
            if (!sizes[0].endsWith('pt')) throw new Error('Papersize special width must be in points.');
            if (!sizes[1].endsWith('pt')) throw new Error('Papersize special height must be in points.');

            yield new Papersize(parseFloat(sizes[0].replace(/pt$/, '')), parseFloat(sizes[1].replace(/pt$/, '')));
        } else {
            yield command;
        }
    }
}
