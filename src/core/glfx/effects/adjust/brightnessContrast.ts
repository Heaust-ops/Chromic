import { Shader } from "../../core/shader";
import type { GLFX } from "../../glfx";
import { clamp } from "../../utils";

/**
 * @filter           Brightness / Contrast
 * @description      Provides additive brightness and multiplicative contrast control.
 * @param glfx       the glfx instance you want this applied to
 * @param brightness -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * @param contrast   -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */
export const brightnessContrast = (
  glfx: GLFX,
  brightness: number,
  contrast: number
) => {
  glfx.brightnessContrastS =
    glfx.brightnessContrastS ||
    new Shader(
      glfx,
      undefined,
      "\
        uniform sampler2D texture;\
        uniform float brightness;\
        uniform float contrast;\
        varying vec2 texCoord;\
        void main() {\
            vec4 color = texture2D(texture, texCoord);\
            color.rgb += brightness;\
            if (contrast > 0.0) {\
                color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;\
            } else {\
                color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;\
            }\
            gl_FragColor = color;\
        }\
    "
    );

  glfx.simpleShader.call(glfx, glfx.brightnessContrastS, {
    brightness: clamp(-1, brightness, 1),
    contrast: clamp(-1, contrast, 1),
  });
};
