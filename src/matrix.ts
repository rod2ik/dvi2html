// The matrix is in the format of an svg transform matrix.  In other words it is the matrix
// [[ values[0], values[3], values[5] ],
//  [ values[2], values[4], values[6] ],
//  [     0    ,     0    ,     1     ]]
type valueArray = [number, number, number, number, number, number];
export default class Matrix {
    private values: valueArray;

    constructor(m?: Matrix | void) {
        this.values = m ? (m.values.slice(0) as valueArray) : [1, 0, 0, 1, 0, 0];
    }

    isIdentity(): boolean {
        return (
            Math.abs(this.values[0] - 1) < Number.EPSILON &&
            Math.abs(this.values[1]) < Number.EPSILON &&
            Math.abs(this.values[2]) < Number.EPSILON &&
            Math.abs(this.values[3] - 1) < Number.EPSILON &&
            Math.abs(this.values[4]) < Number.EPSILON &&
            Math.abs(this.values[5]) < Number.EPSILON
        );
    }

    // this = this * A
    multiplyRight(A: Matrix): Matrix {
        const result = new Matrix();
        result.values[0] = this.values[0] * A.values[0] + this.values[2] * A.values[1];
        result.values[1] = this.values[1] * A.values[0] + this.values[3] * A.values[1];
        result.values[2] = this.values[0] * A.values[2] + this.values[2] * A.values[3];
        result.values[3] = this.values[1] * A.values[2] + this.values[3] * A.values[3];
        result.values[4] = this.values[0] * A.values[4] + this.values[2] * A.values[5] + this.values[4];
        result.values[5] = this.values[1] * A.values[4] + this.values[3] * A.values[5] + this.values[5];
        this.values = A.values;
        return this;
    }

    // this = this * [[x, 0, 0], [0, y, 0], [0, 0, 1]]
    scale(x: number, y: number): Matrix {
        this.values[0] *= x;
        this.values[1] *= x;
        this.values[2] *= y;
        this.values[3] *= y;
        return this;
    }

    // this = this * [[1, 0, x], [0, 1, y], [0, 0, 1]]
    translate(x: number, y: number): Matrix {
        this.values[4] = this.values[0] * x + this.values[2] * y + this.values[4];
        this.values[5] = this.values[1] * x + this.values[3] * y + this.values[5];
        return this;
    }

    // this = this * [[cos(x), sin(x), 0], [-sin(x), cos(x), 0], [0, 0, 1]]
    // x is in degrees
    rotate(x: number): Matrix {
        const rad = (x * Math.PI) / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        this.values[0] = this.values[0] * c + this.values[2] * s;
        this.values[1] = this.values[1] * c + this.values[3] * s;
        this.values[2] = -this.values[0] * s + this.values[2] * c;
        this.values[3] = -this.values[1] * s + this.values[3] * c;
        return this;
    }

    toSVGTransform(): string {
        return this.isIdentity() ? '' : ` transform="matrix(${this.values.join(' ')})"`;
    }

    toString(): string {
        return `[${this.values.join(',')}]`;
    }
}
