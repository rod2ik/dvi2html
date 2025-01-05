import { DviCommand, Special, merge } from '../parser';
import type { Machine } from '../machine';
import PSInterpreter from './psinterpreter';

class PS extends DviCommand {
    ps: string;

    constructor(ps: string) {
        super({});
        this.ps = ps;
    }

    execute(machine: Machine) {
        const interpreter = new PSInterpreter(machine, this.ps);
        interpreter.interpret(machine);
    }

    toString(): string {
        return `PS: ${this.ps}`;
    }
}

async function* specialsPS(commands: AsyncGenerator<DviCommand>) {
    for await (const command of commands) {
        if (command instanceof Special) {
            if (!command.x.startsWith('ps: ')) {
                yield command;
            } else {
                yield new PS(command.x.replace(/^ps: /, ''));
            }
        } else {
            yield command;
        }
    }
}

export default function (commands: AsyncGenerator<DviCommand>) {
    return merge(
        specialsPS(commands),
        (command) => command instanceof PS,
        function* (commands: PS[]) {
            yield new PS(commands.map((command) => command.ps).join(' '));
        }
    );
}
