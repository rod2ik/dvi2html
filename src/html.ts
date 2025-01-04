import { Machine, Rule } from './machine';
import { Writable } from 'stream';

export default class HTMLMachine extends Machine {
    output: Writable;
    pointsPerDviUnit: number;

    svgDepth: number;
    color: string;
    colorStack: string[];

    paperwidth: number;
    paperheight: number;

    pushColor(c: string) {
        this.colorStack.push(this.color);
        this.color = c;
    }

    popColor() {
        const result = this.colorStack.pop();
        if (result) this.color = result;
        else throw new Error('Popped from empty color stack');
    }

    setPapersize(width: number, height: number) {
        this.paperwidth = width;
        this.paperheight = height;
    }

    getCurrentPosition(): [number, number] {
        return [this.position.h * this.pointsPerDviUnit, this.position.v * this.pointsPerDviUnit];
    }

    setCurrentPosition(x: number, y: number) {
        this.position.h = x / this.pointsPerDviUnit;
        this.position.v = y / this.pointsPerDviUnit;
    }

    putHTML(html: string) {
        this.output.write(html);
    }

    putSVG(svg: string) {
        const left = this.position.h * this.pointsPerDviUnit;
        const top = this.position.v * this.pointsPerDviUnit;

        this.svgDepth += (svg.match(/<svg.*>/g) || []).length;
        this.svgDepth -= (svg.match(/<\/svg.*>/g) || []).length;

        if (svg.match(/<svg beginpicture>/)) {
            if (this.svgDepth > 1) {
                // In this case we are inside another svg element so drop the svg start tags.
                svg = svg.replace('<svg beginpicture>', '');
            } else {
                svg = svg.replace(
                    '<svg beginpicture>',
                    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ` +
                        `xmlns:xlink="http://www.w3.org/1999/xlink" ` +
                        `width="${this.paperwidth}pt" height="${this.paperheight}pt" ` +
                        `viewBox="-72 -72 ${this.paperwidth} ${this.paperheight}">`
                );
            }
        }

        if (svg.match(/<\/svg endpicture>/)) {
            // If we are inside another svg element, then drop the svg end tag.
            // Otherwise just remove the " endpicture" bit.
            svg = svg.replace('<\/svg endpicture>', this.svgDepth > 0 ? '' : '<\/svg>');
        }

        svg = svg.replace(/{\?x}/g, left.toString());
        svg = svg.replace(/{\?y}/g, top.toString());

        this.output.write(svg);
    }

    constructor(o: Writable) {
        super();
        this.output = o;
        this.color = 'black';
        this.colorStack = [];
        this.svgDepth = 0;
    }

    preamble(numerator: number, denominator: number, magnification: number, _comment: string) {
        this.pointsPerDviUnit = (((magnification * numerator) / 1000.0 / denominator) * 72.27) / 100000.0 / 2.54;
    }

    putRule(rule: Rule) {
        const a = rule.a * this.pointsPerDviUnit;
        const b = rule.b * this.pointsPerDviUnit;
        const left = this.position.h * this.pointsPerDviUnit;
        const bottom = this.position.v * this.pointsPerDviUnit;
        const top = bottom - a;

        this.output.write(
            `<rect x="${left}" y="${top}" width="${b}" height="${a}" fill="${this.color}"` +
                `${this.matrix.toSVGTransform()}></rect>`
        );
    }

    putText(text: Buffer): number {
        let textWidth = 0;
        let textHeight = 0;
        let textDepth = 0;

        let htmlText = '';

        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            let metrics = this.font.metrics.characters[c];
            if (metrics === undefined) {
                //TODO: Handle this better. Error only happens for c === 127
                console.error(`Could not find font metric for ${c}`);
                metrics = this.font.metrics.characters[126];
            }

            textWidth += metrics.width;
            textHeight = Math.max(textHeight, metrics.height);
            textDepth = Math.max(textDepth, metrics.depth);

            // This is ridiculous.
            if (c >= 0 && c <= 9) {
                htmlText += `&#${161 + c};`;
            } else if (c >= 10 && c <= 19) {
                htmlText += `&#${173 + c - 10};`;
            } else if (c == 20) {
                htmlText += `&#${8729};`; // O RLLY?!
            } else if (c >= 21 && c <= 32) {
                htmlText += `&#${184 + c - 21};`;
            } else if (c == 127) {
                htmlText += `&#${196};`;
            } else {
                htmlText += String.fromCharCode(c);
            }
        }

        // tfm is based on 1/2^16 pt units, rather than dviunit which is 10^−7 meters
        const dviUnitsPerFontUnit = ((this.font.metrics.designSize / 1048576.0) * 65536) / 1048576;

        const left = this.position.h * this.pointsPerDviUnit;
        const height = textHeight * this.pointsPerDviUnit * dviUnitsPerFontUnit;
        const top = this.position.v * this.pointsPerDviUnit;

        const fontsize = ((this.font.metrics.designSize / 1048576.0) * this.font.scaleFactor) / this.font.designSize;

        if (this.svgDepth == 0) {
            this.output.write(
                `<span style="line-height: 0; color: ${this.color}; font-family: ${this.font.name}; font-size: ${
                    fontsize
                }pt; position: absolute; top: ${top - height}pt; left: ${
                    left
                }pt; overflow: visible;"><span style="margin-top: -${fontsize}pt; line-height: ${0}pt; height: ${
                    fontsize
                }pt; display: inline-block; vertical-align: baseline; ">${
                    htmlText
                }</span><span style="display: inline-block; vertical-align: ${
                    height
                }pt; height: ${0}pt; line-height: 0;"></span></span>`
            );
        } else {
            const bottom = this.position.v * this.pointsPerDviUnit;
            // No 'pt' on fontsize since those units are potentially scaled
            this.output.write(
                `<text alignment-baseline="baseline" y="${bottom}" x="${left}" ` +
                    `font-family="${this.font.name}" font-size="${fontsize}" ` +
                    `fill="${this.color}"${this.matrix.toSVGTransform()}>` +
                    `${htmlText}</text>`
            );
        }

        return (textWidth * dviUnitsPerFontUnit * this.font.scaleFactor) / this.font.designSize;
    }
}
