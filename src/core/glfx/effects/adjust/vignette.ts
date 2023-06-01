import { Shader } from "../../core/shader";
import type { GLFX } from "../../glfx";
import { clamp } from "../../utils";

/**
 * @filter         Vignette
 * @description    Adds a simulated lens edge darkening effect.
 * @param glfx     the glfx instance you want this applied to
 * @param size     0 to 1 (0 for center of frame, 1 for edge of frame)
 * @param amount   0 to 1 (0 for no effect, 1 for maximum lens darkening)
 */
export const vignette = (glfx: GLFX, size: number, amount: number) => {
  glfx.vignetteS =
    glfx.vignetteS ||
    new Shader(
      glfx,
      undefined,
      "\
        uniform sampler2D texture;\
        uniform float size;\
        uniform float amount;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            \
            float dist = distance(texCoord, vec2(0.5, 0.5));\
            color.rgb *= smoothstep(0.8, size * 0.799, dist * (amount + size));\
            \
            gl_FragColor = color;\
        }\
    "
    );

  glfx.simpleShader.call(glfx, glfx.vignetteS, {
    size: clamp(0, size, 1),
    amount: clamp(0, amount, 1),
  });
};
