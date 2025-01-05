import { DviCommand, Special, merge } from '../parser';
import type { Machine } from '../machine';

class SVG extends DviCommand {
    svg: string;

    constructor(svg: string) {
        super({});
        this.svg = svg;
    }

    execute(machine: Machine) {
        machine.putSVG(this.svg);
    }
}

async function* specialsToSVG(commands: AsyncGenerator<DviCommand>) {
    for await (const command of commands) {
        if (command instanceof Special) {
            if (!command.x.startsWith('dvisvgm:raw ')) {
                yield command;
            } else {
                yield new SVG(command.x.replace(/^dvisvgm:raw /, ''));
            }
        } else {
            yield command;
        }
    }
}

export default function (commands: AsyncGenerator<DviCommand>) {
    return merge(
        specialsToSVG(commands),
        (command) => command instanceof SVG,
        function* (commands: SVG[]) {
            yield new SVG(
                commands
                    .map((command) => command.svg)
                    .join('')
                    .replace(/{\?nl}/g, '')
            );
        }
    );
}
