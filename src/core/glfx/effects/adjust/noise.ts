import { Shader } from "../../core/shader";
import type { GLFX } from "../../glfx";
import { clamp } from "../../utils";

/**
 * @filter         Noise
 * @description    Adds black and white noise to the image.
 * @param glfx     the glfx instance you want this applied to
 * @param amount   0 to 1 (0 for no effect, 1 for maximum noise)
 */
export const noise = (glfx: GLFX, amount: number) => {
  glfx.noiseS =
    glfx.noiseS ||
    new Shader(
      glfx,
      undefined,
      "\
        uniform sampler2D texture;\
        uniform float amount;\
        varying vec2 texCoord;\
        float rand(vec2 co) {\
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\
        }\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            \
            float diff = (rand(texCoord) - 0.5) * amount;\
            color.r += diff;\
            color.g += diff;\
            color.b += diff;\
            \
            gl_FragColor = color;\
        }\
    "
    );

  glfx.simpleShader.call(glfx, glfx.noiseS, {
    amount: clamp(0, amount, 1),
  });
};
