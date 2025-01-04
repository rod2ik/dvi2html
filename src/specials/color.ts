import { DviCommand, Special } from '../parser';
import { Machine } from '../machine';

class PushColor extends DviCommand {
    color: string;

    constructor(color: string) {
        super({});
        this.color = color;
    }

    execute(machine: Machine) {
        machine.pushColor(this.color);
    }

    toString(): string {
        return `PushColor { color: '${this.color}' }`;
    }
}

class PopColor extends DviCommand {
    constructor() {
        super({});
    }

    execute(machine: Machine) {
        machine.popColor();
    }

    toString(): string {
        return `PopColor { }`;
    }
}

function intToHex(n: number) {
    return ('00' + Math.round(n).toString(16)).slice(-2);
}

function texColor(name: string) {
    if (name == 'gray 0') return 'black';
    if (name == 'gray 1') return 'white';
    if (name.startsWith('rgb ')) {
        return (
            '#' +
            name
                .split(' ')
                .slice(1)
                .map(function (x) {
                    return intToHex(parseFloat(x) * 255);
                })
                .join('')
        );
    }
    if (name.startsWith('gray ')) {
        const x = name.split(' ')[1];
        return texColor('rgb ' + x + ' ' + x + ' ' + x);
    }
    return 'black';
}

export default async function* (commands: AsyncGenerator<DviCommand>) {
    for await (const command of commands) {
        if (command instanceof Special) {
            if (!command.x.startsWith('color ')) {
                yield command;
            } else {
                if (command.x.startsWith('color push ')) {
                    yield new PushColor(texColor(command.x.replace(/^color push /, '')));
                }

                if (command.x.startsWith('color pop')) {
                    yield new PopColor();
                }
            }
        } else {
            yield command;
        }
    }
}
