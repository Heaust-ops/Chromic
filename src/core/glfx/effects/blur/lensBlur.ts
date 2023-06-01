import { Shader } from "../../core/shader";
import type { GLFX } from "../../glfx";
import { clamp, randomShaderFunc } from "../../utils";

/**
 * @filter           Lens Blur
 * @description      Imitates a camera capturing the image out of focus by using a blur that generates
 *                   the large shapes known as bokeh. The polygonal shape of real bokeh is due to the
 *                   blades of the aperture diaphragm when it isn't fully open. glfx blur renders
 *                   bokeh from a 6-bladed diaphragm because the computation is more efficient. It
 *                   can be separated into three rhombi, each of which is just a skewed box blur.
 *                   glfx filter makes use of the floating point texture WebGL extension to implement
 *                   the brightness parameter, so there will be severe visual artifacts if brightness
 *                   is non-zero and the floating point texture extension is not available. The
 *                   idea was from John White's SIGGRAPH 2011 talk but glfx effect has an additional
 *                   brightness parameter that fakes what would otherwise come from a HDR source.
 * @param glfx     the glfx instance you want this applied to
 * @param radius     the radius of the hexagonal disk convolved with the image
 * @param brightness -1 to 1 (the brightness of the bokeh, negative values will create dark bokeh)
 * @param angle      the rotation of the bokeh in radians
 */
export const lensBlur = (glfx: GLFX, radius: number, brightness: number, angle: number) => {
    // All averaging is done on values raised to a power to make more obvious bokeh
    // (we will raise the average to the inverse power at the end to compensate).
    // Without glfx the image looks almost like a normal blurred image. glfx hack is
    // obviously not realistic, but to accurately simulate glfx we would need a high
    // dynamic range source photograph which we don't have.
    glfx.lensBlurPrePass = glfx.lensBlurPrePass || new Shader(glfx,undefined, '\
        uniform sampler2D texture;\
        uniform float power;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            color = pow(color, vec4(power));\
            gl_FragColor = vec4(color);\
        }\
    ');

    const common = '\
        uniform sampler2D texture0;\
        uniform sampler2D texture1;\
        uniform vec2 delta0;\
        uniform vec2 delta1;\
        uniform float power;\
        varying vec2 texCoord;\
        ' + randomShaderFunc + '\
        vec4 sample(vec2 delta) {\
            /* randomize the lookup values to hide the fixed number of samples */\
            float offset = random(vec3(delta, 151.7182), 0.0);\
            \
            vec4 color = vec4(0.0);\
            float total = 0.0;\
            for (float t = 0.0; t <= 30.0; t++) {\
                float percent = (t + offset) / 30.0;\
                color += texture2D(texture0, texCoord + delta * percent);\
                total += 1.0;\
            }\
            return color / total;\
        }\
    ';

    glfx.lensBlur0 = glfx.lensBlur0 || new Shader(glfx, undefined, common + '\
        void main() {\
            gl_FragColor = sample(delta0);\
        }\
    ');
    glfx.lensBlur1 = glfx.lensBlur1 || new Shader(glfx, undefined, common + '\
        void main() {\
            gl_FragColor = (sample(delta0) + sample(delta1)) * 0.5;\
        }\
    ');
    glfx.lensBlur2 = glfx.lensBlur2 || new Shader(glfx, undefined, common + '\
        void main() {\
            vec4 color = (sample(delta0) + 2.0 * texture2D(texture1, texCoord)) / 3.0;\
            gl_FragColor = pow(color, vec4(power));\
        }\
    ').textures({ texture1: 1 });

    // Generate
    const dir = [];
    for (let i = 0; i < 3; i++) {
        const a = angle + i * Math.PI * 2 / 3;
        dir.push([radius * Math.sin(a) / glfx.width!, radius * Math.cos(a) / glfx.height!]);
    }
    const power = Math.pow(10, clamp(-1, brightness, 1));

    // Remap the texture values, which will help make the bokeh effect
    glfx.simpleShader.call(glfx, glfx.lensBlurPrePass, {
        power: power
    });

    // Blur two rhombi in parallel into extraTexture
    glfx.extraTexture?.ensureFormat(glfx.texture!);
    glfx.simpleShader.call(glfx, glfx.lensBlur0, {
        delta0: dir[0]
    }, glfx.texture, glfx.extraTexture);
    glfx.simpleShader.call(glfx, glfx.lensBlur1, {
        delta0: dir[1],
        delta1: dir[2]
    }, glfx.extraTexture, glfx.extraTexture);

    // Blur the last rhombus and combine with extraTexture
    glfx.simpleShader.call(glfx, glfx.lensBlur0, {
        delta0: dir[1]
    });
    glfx.extraTexture?.use(1);
    glfx.simpleShader.call(glfx, glfx.lensBlur2, {
        power: 1 / power,
        delta0: dir[2]
    });
}
