export class TfmChar {
    tfm: Tfm;
    char_code: number;
    width: number;
    height: number;
    depth: number;
    italic_correction: number;
    lig_kern_program_index: number;
    next_larger_char: number;

    constructor(
        tfm: Tfm,
        char_code: number,
        width: number,
        height: number,
        depth: number,
        italic_correction: number,
        lig_kern_program_index: number,
        next_larger_char: number
    ) {
        this.tfm = tfm;
        tfm.set_char(char_code, this);

        this.char_code = char_code;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.italic_correction = italic_correction;

        this.lig_kern_program_index = lig_kern_program_index;
        this.next_larger_char = next_larger_char;
    }

    // Return the width scaled by scale_factor.
    scaled_width(scale_factor: number) {
        return this.width * scale_factor;
    }

    // Return the height scaled by scale_factor.
    scaled_height(scale_factor: number) {
        return this.height * scale_factor;
    }

    // Return the depth scaled by scale_factor.
    scaled_depth(scale_factor: number) {
        return Number(this.depth * scale_factor);
    }

    // Return the 3-tuple consisting of the width, height and depth scaled by scale_factor.
    scaled_dimensions(scale_factor: number) {
        return [this.width, this.height, this.depth].map((x) => x * scale_factor);
    }

    // Return the `TfmChar` instance for the next larger char if it exists.  Otherwise return null.
    next_larger_tfm_char() {
        return this.next_larger_char !== null ? this.tfm.get_char(this.next_larger_char) : null;
    }

    // Get the ligature/kern program of the character.
    get_lig_kern_program() {
        return this.lig_kern_program_index !== null ? this.tfm.get_lig_kern_program(this.lig_kern_program_index) : null;
    }
}

// This class encapsulates a TeX Font Metric for an extensible Glyph.
export class TfmExtensibleChar extends TfmChar {
    top: number;
    mid: number;
    bot: number;
    rep: number[];

    constructor(
        tfm: Tfm,
        char_code: number,
        width: number,
        height: number,
        depth: number,
        italic_correction: number,
        extensible_recipe: number[],
        lig_kern_program_index: number,
        next_larger_char: number
    ) {
        super(tfm, char_code, width, height, depth, italic_correction, lig_kern_program_index, next_larger_char);
        this.rep = extensible_recipe;
    }
}

export class TfmLigKern {
    tfm: Tfm;
    stop: boolean;
    index: number;
    next_char: number;

    constructor(tfm: Tfm, index: number, stop: boolean, next_char: number) {
        this.tfm = tfm;
        this.stop = stop;
        this.index = index;
        this.next_char = next_char;
        this.tfm.add_lig_kern(this);
    }
}

// This class represents a Kerning Program Instruction.
export class TfmKern extends TfmLigKern {
    kern: number;

    constructor(tfm: Tfm, index: number, stop: boolean, next_char: number, kern: number) {
        super(tfm, index, stop, next_char);
        this.kern = kern;
    }
}

// This class represents a Ligature Program Instruction.
export class TfmLigature extends TfmLigKern {
    ligature_char_code: number;
    number_of_chars_to_pass_over: number;
    current_char_is_deleted: boolean;
    next_char_is_deleted: boolean;

    constructor(
        tfm: Tfm,
        index: number,
        stop: boolean,
        next_char: number,
        ligature_char_code: number,
        number_of_chars_to_pass_over: number,
        current_char_is_deleted: boolean,
        next_char_is_deleted: boolean
    ) {
        super(tfm, index, stop, next_char);
        this.ligature_char_code = ligature_char_code;
        this.number_of_chars_to_pass_over = number_of_chars_to_pass_over;
        this.current_char_is_deleted = current_char_is_deleted;
        this.next_char_is_deleted = next_char_is_deleted;
    }
}

// This class encapsulates a TeX Font Metric for a font.
export class Tfm {
    smallest_character_code: number;
    largest_character_code: number;
    checksum: number;
    designSize: number;
    character_coding_scheme: string;
    family: string;

    slant: number;
    spacing: number;
    space_stretch: number;
    space_shrink: number;
    x_height: number;
    quad: number;
    extra_space: number;
    num1: number;
    num2: number;
    num3: number;
    denom1: number;
    denom2: number;
    sup1: number;
    sup2: number;
    sup3: number;
    sub1: number;
    sub2: number;
    supdrop: number;
    subdrop: number;
    delim1: number;
    delim2: number;
    axis_height: number;
    default_rule_thickness: number;
    big_op_spacing: number[];

    _lig_kerns: TfmLigKern[];
    characters: any;

    constructor(
        smallest_character_code: number,
        largest_character_code: number,
        checksum: number,
        designSize: number,
        character_coding_scheme: string,
        family: string
    ) {
        this.smallest_character_code = smallest_character_code;
        this.largest_character_code = largest_character_code;
        this.checksum = checksum;
        this.designSize = designSize;
        this.character_coding_scheme = character_coding_scheme;
        this.family = family;

        this._lig_kerns = [];
        this.characters = {};
    }

    get_char(x: number) {
        return this.characters[x];
    }

    set_char(x: number, y: any) {
        this.characters[x] = y;
    }

    // Set the font parameters.
    set_font_parameters(parameters: number[]) {
        this.slant = parameters[0];
        this.spacing = parameters[1];
        this.space_stretch = parameters[2];
        this.space_shrink = parameters[3];
        this.x_height = parameters[4];
        this.quad = parameters[5];
        this.extra_space = parameters[6];
    }

    // Set the math symbols parameters.
    set_math_symbols_parameters(parameters: number[]) {
        this.num1 = parameters[0];
        this.num2 = parameters[1];
        this.num3 = parameters[2];
        this.denom1 = parameters[3];
        this.denom2 = parameters[4];
        this.sup1 = parameters[5];
        this.sup2 = parameters[6];
        this.sup3 = parameters[7];
        this.sub1 = parameters[8];
        this.sub2 = parameters[9];
        this.supdrop = parameters[10];
        this.subdrop = parameters[11];
        this.delim1 = parameters[12];
        this.delim2 = parameters[13];
        this.axis_height = parameters[14];
    }

    set_math_extension_parameters(parameters: number[]) {
        this.default_rule_thickness = parameters[0];
        this.big_op_spacing = parameters.slice(1);
    }

    // Add a ligature/kern program obj.
    add_lig_kern(obj: TfmLigKern) {
        this._lig_kerns.push(obj);
    }

    // Return the ligature/kern program at index i.
    get_lig_kern_program(i: number) {
        return this._lig_kerns[i];
    }
}
