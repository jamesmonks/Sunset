async function attempt_stuff()
{
    let canvas = $("#perlin3")[0];
    canvas.setAttribute("id", "perlin_canvas");
    canvas.setAttribute("width", "800");
    canvas.setAttribute("height", "600");
    let context = canvas.getContext("2d");
    let img_data = context.createImageData(800, 600);
    let perlin_1 = new __Perlin_Options(false, false, 255, false, false, new __RGBA_Tint(255, 0, 128, 255), true, true, true, false);
    let perlin_2 = new __Perlin_Options(false, false, 128, true, true, new __RGBA_Tint(255, 255, 128, 255), true, true, true, false);
    perlin_noise(img_data, 6, 32, perlin_1);
    perlin_noise(img_data, 12, 64, perlin_2);
    multiply_top_to_bottom(.25, 1.0, img_data);
    context.putImageData(img_data,0, 0);
    let img_data_url = canvas.toDataURL();
    $(".water-overlay")[0].style.background='url('+img_data_url+')';
}

async function generate_sky_canvas(canvas)
{
    console.log("generating");
    let context = canvas.getContext("2d");
    let img_data = context.createImageData(800, 600);
    await create_noise(img_data, false, true);
    context.putImageData(img_data,0,0);
    img_data = context.getImageData(0, 0, canvas.width, canvas.height);
    // ctx2d.drawImage(img_data, 0, 0);
    // let perlin_1 = new __Perlin_Options(false, false, 255, false, false, new __RGBA_Tint(128, 255, 226, 255), true, true, true, false);
    let perlin_1 = new __Perlin_Options(false, false, 255, false, false, new __RGBA_Tint(128, 128, 160, 255), true, true, true, false);
    let perlin_2 = new __Perlin_Options(false, false, 128, true, false, new __RGBA_Tint(128, 128, 160, 255), true, true, true, false);
    perlin_noise(img_data, 3, 9, perlin_1);
    perlin_noise(img_data, 6, 18, perlin_2);
    threshold(img_data, 48, 255, 0, 255, false);
    multiply_top_to_bottom(1, -0.5, img_data);
    // perlin_noise(img_data, 16, 12, false, false, 128, true, true, false, false, false);
    // perlin_noise(img_data, 16, 12, false, false, 64);
    context.putImageData(img_data,0,0);
}

async function stitch_me_up()
{
    let canvas = document.createElement("canvas");
    canvas.setAttribute("width", "800");
    canvas.setAttribute("height", "600");
    let context = canvas.getContext("2d");
    let img_data = context.createImageData(800, 600);
    let perlin_1 = new __Perlin_Options(false, false, 255, false, false, new __RGBA_Tint(255, 0, 128, 255), true, true, true, false);
    let perlin_2 = new __Perlin_Options(false, false, 128, true, true, new __RGBA_Tint(255, 255, 128, 255), true, true, true, false);
    perlin_noise(img_data, 6, 32, perlin_1);
    perlin_noise(img_data, 12, 64, perlin_2);
    multiply_top_to_bottom(.05, 0.5, img_data);
    context.putImageData(img_data, 0, 0);

    $(canvas).addClass("perlin-canvas");
    $("body").append(canvas);
}

/**
 * Function creates a noise map
 * @param {*} img_data The ImageData object to create noise in
 * @param {*} seperate_channels Seperate rgba channels or set to the same value
 * @param {*} alpha_is_255 Default is 0 unless alpha_only_value is set. Setting this overwrites the alpha value and sets it to 1
 * @param {*} red_only_value Create a random red value, 0 otherwise
 * @param {*} green_only_value Create a random green value, 0 otherwise
 * @param {*} blue_only_value Create a random blue value, 0 otherwise
 * @param {*} alpha_only_value Create a random alpha value, 0 otherwise
 */
async function create_noise(  img_data, seperate_channels = false, alpha_is_255 = false, 
                        red_only_value = false, green_only_value = false, blue_only_value = false, alpha_only_value = false) 
{
    console.log("starting noise");
    let iter= 0;
    //+=4 as this is just a one dimensional array that has rgba values
    for (let i=0; i < img_data.data.length; i += 4)
    {
        iter++;
        if (!seperate_channels)
        {
            img_data.data[i] = img_data.data[i+1] = img_data.data[i+2] = img_data.data[i+3] = generate_color_value();
            // console.log(img_data.data[i]);
        }
        else 
        {
            img_data.data[i]    =   (red_only_value) ? generate_color_value() : 0;
            img_data.data[i+1]  = (green_only_value) ? generate_color_value() : 0;
            img_data.data[i+2]  =  (blue_only_value) ? generate_color_value() : 0;
            img_data.data[i+3]  = (alpha_only_value) ? generate_color_value() : 0;
        }
        if (alpha_is_255)
            img_data.data[i+3] = 255;
    }
    console.log(img_data.data.length, iter);
    console.log("ending noise");
}

async function multiply_top_to_bottom(top_multiple, bottom_multiple, img_data)
{
    let width = img_data.width;
    let height = img_data.height;
    let px_rgba, multiple;

    for (let px=0; px < img_data.data.length; px+=4)
    {
        multiple = top_multiple + (bottom_multiple - top_multiple) * ( (px / (4*width)) / height)

        px_rgba = get_pxl_color(img_data, px);
        set_pxl_color(img_data, px, px_rgba.r * multiple, px_rgba.g * multiple, px_rgba.b * multiple, px_rgba.a * multiple);
    }
}

async function threshold(img_data, lower_threshold, upper_threshold, lowest_value, highest_value, ignore_alpha = true)
{
    let thres_range = upper_threshold - lower_threshold;
    let value_range = highest_value - lowest_value;
    let px_rgba;

    console.log(thres_range, value_range);

    for (let px=0; px < img_data.data.length; px+=4)
    {
        px_rgba = get_pxl_color(img_data, px);
        px_rgba.r = get_value(px_rgba.r);
        px_rgba.g = get_value(px_rgba.g);
        px_rgba.b = get_value(px_rgba.b);
        if (!ignore_alpha)
            px_rgba.a = get_value(px_rgba.a);

        set_pxl_color(img_data, px, px_rgba.r, px_rgba.g, px_rgba.b, px_rgba.a);
    }

    function get_value(val)
    {
        if (val < lower_threshold || val > upper_threshold)
            return 0;
        return lowest_value + value_range * ((val - lower_threshold) / thres_range)
    }
}

function generate_color_value()
{
    return clamp_color(Math.floor(Math.random() * 256));
}

async function perlin_noise(img_data, columns, rows, options)
{
    console.log("starting perlin");
    let spacing = get_grid_spacing(img_data, columns, rows);
    let grid = create_grid(columns, rows, options.stitch_x, options.stitch_y);
    // console.log(spacing);
    // grid.forEach(element => {
    //     console.log(element);
    // });
    let width = img_data.width; //801 400 is yes
    let height = img_data.height;
    let half_width_limit = Math.floor(width * .5);
    let half_height_limit = Math.floor(height * .5);
    let min_value = max_value = carry_on = 0;
    
    let iter=0;

    let offset = Math.SQRT2 / 2;

    for (let px=0; px < img_data.data.length; px += 4)
    {
        carry_on = true;
        iter++;
        let color = get_pxl_color(img_data, px);
        let px_pos = get_x_y_pos(img_data, px, spacing);
        

        if (options.stitch_x && px_pos.x >= half_width_limit)
        {
            //jump to start of next row
            carry_on = false;
            px = (px_pos.y + 1) * width * 4 - 4; //-4 as the end of the for loop adds 4
        }
        if (options.stitch_y && px_pos.y > half_height_limit)
        {
            //this is the end
            break;
        }
        // if (px < 3700 && px > 3600)
        //     console.log(px_pos);

        //get the left/right grids
        if (carry_on) {
            let gl_x0 = Math.floor(px_pos.x / spacing.x);
            let gl_x1 = gl_x0 + 1;
            if (gl_x1 == grid.length) //literally the edge case
                gl_x1--;
            //get the top/bottom grids
            let gl_y0 = Math.floor(px_pos.y / spacing.y);
            let gl_y1 = gl_y0 + 1;
            if (gl_y1 == grid[0].length) //literally the edge case
                gl_y1--;

            let tl_grad = grid[ gl_x0 ][ gl_y0 ];
            let tr_grad = grid[ gl_x1 ][ gl_y0 ];
            let bl_grad = grid[ gl_x0 ][ gl_y1 ];
            let br_grad = grid[ gl_x1 ][ gl_y1 ];

            let tl_xy = {       x: px_pos.x_unit,              y: px_pos.y_unit             };
            let tr_xy = {       x: px_pos.x_unit - 1,          y: px_pos.y_unit             };
            let bl_xy = {       x: px_pos.x_unit,              y: px_pos.y_unit - 1         };
            let br_xy = {       x: px_pos.x_unit - 1,          y: px_pos.y_unit - 1         };

            let tl_dot = dot_product(tl_grad, tl_xy);
            let tr_dot = dot_product(tr_grad, tr_xy);
            let bl_dot = dot_product(bl_grad, bl_xy);
            let br_dot = dot_product(br_grad, br_xy);

            let tx = tl_dot + px_pos.x_ease * (tr_dot - tl_dot);
            let bx = bl_dot + px_pos.x_ease * (br_dot - bl_dot);
            let value  = tx + px_pos.y_ease * (bx - tx);
            //value /= Math.SQRT2;
            //value = (value + 1) / 2;
            
            if (min_value > value || max_value < value)
            {
                min_value = Math.min(min_value, value);
                max_value = Math.max(max_value, value);
                // console.log("new:", min_value, max_value);
                // console.log("used:", min_value / Math.SQRT2, max_value / Math.SQRT2);
                // console.log(color);
                // console.log(`line1: `, gl_x1, gl_x2, gl_y1, gl_y2);
                // console.log(`line2A: `, tl_grad, ` <-> `, tl_xy, ` :: `, tr_grad, ` <-> `, tr_xy);
                // console.log(`line2B: `, tl_dot, ` :: `, tr_dot);
                // console.log(`line3A: `, bl_grad, ` <-> `, bl_xy, ` :: `, br_grad, ` <-> `, br_xy);
                // console.log(`line3B: `, bl_dot, ` :: `, br_dot);
            }

            let limit = 800 * 4 * 101;
            // if (px > limit - 50 && px < limit + 400)
            // {
            //     console.log("a", tl_xy, tr_xy);
            //     console.log("b", bl_xy, br_xy);
            // }

            value /= Math.SQRT2;
            
            if (!options.additive)
                value = 0.5 + value;
            if (options.no_negative)
                value = Math.max(0, value);
            
            let scaled_value = value * options.factor;
            let r_value = scaled_value * options.rgba_tint_values.r_unit;
            let g_value = scaled_value * options.rgba_tint_values.g_unit;
            let b_value = scaled_value * options.rgba_tint_values.b_unit;
            let a_value = scaled_value * options.rgba_tint_values.a_unit;
            
            let r_dot = color.r, g_dot = color.g, b_dot = color.b, a_dot = color.a;

            if (options.alter_red_value)
                r_dot = (options.additive) ? color.r + r_value : r_value;
            if (options.alter_green_value)
                g_dot = (options.additive) ? color.g + g_value : g_value;
            if (options.alter_blue_value)
                b_dot = (options.additive) ? color.b + b_value : b_value;
            if (options.alter_alpha_value)
                a_dot = (options.additive) ? color.a + a_value : a_value;

            set_pxl_color(img_data, px, r_dot, g_dot, b_dot, a_dot);
            if (options.stitch_x)
                console.log("reflect right");
            if (options.stitch_y)
                console.log("reflect down");
            if (options.stitch_x && options.stitch_y)
                console.log("reflect_diagonally");
        }
    }
    console.log(iter);
    console.log("min, max:", min_value, max_value);
}

function easing_function(value)
{
    return (value * value * value) * (10 + (value * (value * 6 - 15)));
}

function convert_to_unit_color(color)
{
    let color2 = {
        r: color.r / 255,
        g: color.g / 255,
        b: color.b / 255,
        a: color.a / 255
    }
    return color2;
}

function get_x_y_pos(img_data, px, spacing)
{
    let k = img_data.width * 4;
    let x = (px % k) / 4;
    let y = Math.floor(px/k);
    let x_unit = (x % spacing.x) / spacing.x;
    let y_unit = (y % spacing.y) / spacing.y;
    //LERP easing function 6t^5-15t^4+10t^3
    let x_ease = easing_function(x_unit);
    let y_ease = easing_function(y_unit);
    return {
        x : x,
        y : y,
        x_unit : x_unit,
        y_unit : y_unit,
        x_ease : x_ease,
        y_ease : y_ease
    };
}

function get_pxl_color(img_data, px)
{
    // if (px < 20)
    //     console.log("px, val:", px, img_data.data[px]);
    return {
        r : img_data.data[px],
        g : img_data.data[px+1],
        b : img_data.data[px+2],
        a : img_data.data[px+3]
    }
}

function set_pxl_color(img_data, pos, r, g, b, a)
{
    r = clamp_color(r);
    g = clamp_color(g);
    b = clamp_color(b);
    a = clamp_color(a);

    // if (pos < 10)
    //     console.log("setting data:", pos, img_data.data[pos], r);

    img_data.data[pos] = r;
    img_data.data[pos+1] = g;
    img_data.data[pos+2] = b;
    img_data.data[pos+3] = 255;

}

function clamp_color(value)
{
    if (value < 0)
    {
        // console.log(value, " <0");
        return 0;
    }

    if (value > 255)
    {
        // console.log(value, " >255");
        return 255;
    }

    return value;
}

/**
 * Function gets the grid spacing for the columns and rows. Columns and Rows are to mean the regions between the gridlines
 * and not the number of horizontal/vertical lines themselves, that number of lines will be the columns/rows value plus 1.
 * @param {*} img_data 
 * @param {*} columns 
 * @param {*} rows 
 * @returns 
 */
function get_grid_spacing(img_data, columns, rows) 
{
    let x_disp = Math.ceil(img_data.width / columns);
    let y_disp = Math.ceil(img_data.height / rows);
    return { x : x_disp, y : y_disp };
}

/**
 * Functions creates unit vectors at the points where the vertical and horizontal gridlines meet (nodes).
 * @param {*} columns The number of columns to be generated, NOT the number of vertical gridlines, as this will be columns+1
 * @param {*} rows The number of row to be generated, NOT the number of horizontal gridlines, as this will be rows+1
 * @returns A 2D array representing the grid nodes, first element is in the horizontal and second element is in the vertical. Values
 * at these points are a 2 element array representing a unit vector in the form [x_val, y_val] with values from -1 to 1.
 */
function create_grid(columns, rows, stitch_x, stitch_y) 
{
    let vector_grid = new Array(columns + 1).fill(null).map( () => new Array(rows + 1).fill(null) );
    let total_vert_lines = (stitch_x) ? Math.ceil( (columns+1) / 2) : columns+1;
    let total_horz_lines = (stitch_y) ? Math.ceil( (rows+1) / 2) : rows+1;

    let v_arr = [
        { x : 1, y : 1},
        { x : 1, y : -1},
        { x : -1, y : 1},
        { x : -1, y : -1},
        { x : 0, y : Math.SQRT2},
        { x : 0, y : -Math.SQRT2},
        { x : Math.SQRT2, y : 0},
        { x : -Math.SQRT2, y : 0},
    ];

    for (x=0; x < total_vert_lines; x++)
        for (y=0; y < total_horz_lines; y++)
        {
            let angle = Math.random() * 2 * Math.PI;
            let v_obj = { x : Math.cos(angle) * Math.SQRT2, y : Math.sin(angle) * Math.SQRT2};
            // let v_obj = v_arr[ Math.floor(Math.random() * v_arr.length / 2) ];
            vector_grid[x][y] = v_obj;

            if (stitch_x)
                vector_grid[columns-x][y]       = { x:-v_obj.x, y: v_obj.y };
            if (stitch_y)
                vector_grid[x][rows-y]          = { x: v_obj.x, y:-v_obj.y };
            if (stitch_x && stitch_y)
                vector_grid[columns-x][rows-y]  = { x:-v_obj.x, y:-v_obj.y };
        }
    return vector_grid;
}

/**
 * Function when given two objects with x and y numeric values, returns the dot product.
 * @param {*} v_1 
 * @param {*} v_2 
 * @returns 
 */
function dot_product(v_1, v_2)
{
    return (v_1.x * v_2.x) + (v_1.y * v_2.y);
}

class __Perlin_Options {
    
    constructor(stitch_x = false, stitch_y = false, factor = 255, additive = false, no_negative = false, rgba_tint_values = {r: 255, g: 255, b: 255, a: 255},
        alter_red_value = true, alter_green_value = true, alter_blue_value = true, alter_alpha_value = true )
    {
        this.stitch_x = stitch_x;
        this.stitch_y = stitch_y;
        this.factor = factor;
        this.additive = additive;
        this.no_negative = no_negative;
        this.rgba_tint_values = rgba_tint_values;
        this.alter_red_value = alter_red_value;
        this.alter_green_value = alter_green_value;
        this.alter_blue_value = alter_blue_value;
        this.alter_alpha_value = alter_alpha_value;
    }

    clone()
    {
        return new __Perlin_Options(this.stitch_x, this.stitch_y, this.factor, this.additive, this.no_negative,
            this.alter_red_value, this.alter_green_value, this.alter_blue_value, this.alter_alpha_value);
    }


}

class __RGBA_Tint {
    constructor(r, g, b, a)
    {
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        a = Math.min(255, Math.max(0, a));
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.r_unit = this.r / 255;
        this.g_unit = this.g / 255;
        this.b_unit = this.b / 255;
        this.a_unit = this.a / 255;
    }
}