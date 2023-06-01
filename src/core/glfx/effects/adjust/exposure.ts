import { Shader } from "../../core/shader";
import type { GLFX } from "../../glfx";
import { clamp } from "../../utils";

/**
 * @filter           Exposure
 * @description      Adjusts the exposure of an image.
 * @param glfx       the glfx instance you want this applied to
 * @param amount   -1 to 1 (-1 is minimum exposure, 0 is no change, and 1 is maximum amount)
 */
export const exposure = (glfx: GLFX, amount: number) => {
  glfx.exposureS =
    glfx.exposureS ||
    new Shader(
      glfx,
      undefined,
      "\
        uniform sampler2D texture;\
        uniform float amount;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            color.rgb = color.rgb * pow(2.0, amount);\
            gl_FragColor = color;\
        }\
    "
    );

  glfx.simpleShader.call(glfx, glfx.exposureS, {
    amount: clamp(-1, amount, 1),
  });
};
