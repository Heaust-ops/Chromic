import { Shader } from "../../core/shader";
import type { GLFX } from "../../glfx";
import { triangleBlur } from "../blur/triangleBlur";

/**
 * @filter         Unsharp Mask
 * @description    A form of image sharpening that amplifies high-frequencies in the image. It
 *                 is implemented by scaling pixels away from the average of their neighbors.
 * @param glfx     the glfx instance you want this applied to
 * @param radius   The blur radius that calculates the average of the neighboring pixels.
 * @param strength A scale factor where 0 is no effect and higher values cause a stronger effect.
 */
export const unsharpMask = (glfx: GLFX, radius: number, strength: number) => {
    glfx.unsharpMaskS = glfx.unsharpMaskS || new Shader(glfx, undefined, '\
        uniform sampler2D blurredTexture;\
        uniform sampler2D originalTexture;\
        uniform float strength;\
        uniform float threshold;\
        varying vec2 texCoord;\
        void main() {\
            vec4 blurred = texture2D(blurredTexture, texCoord);\
            vec4 original = texture2D(originalTexture, texCoord);\
            gl_FragColor = mix(blurred, original, 1.0 + strength);\
        }\
    ');

    // Store a copy of the current texture in the second texture unit
    glfx.extraTexture?.ensureFormat(glfx.texture!);
    glfx.texture?.use();
    glfx.extraTexture?.drawTo(function() {
        Shader.getDefaultShader(glfx).drawRect();
    });

    // Blur the current texture, then use the stored texture to detect edges
    glfx.extraTexture?.use(1);
    triangleBlur(glfx, radius);
    glfx.unsharpMaskS.textures({
        originalTexture: 1
    });
    glfx.simpleShader.call(glfx, glfx.unsharpMaskS, {
        strength: strength
    });
    glfx.extraTexture?.unuse(1);
}
