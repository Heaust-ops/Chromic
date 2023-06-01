import { Shader } from "../../core/shader";
import type { GLFX } from "../../glfx";
import { randomShaderFunc } from "../../utils";

/**
 * @filter       Triangle Blur
 * @description  This is the most basic blur filter, which convolves the image with a
 *               pyramid filter. The pyramid filter is separable and is applied as two
 *               perpendicular triangle filters.
 * @param glfx     the glfx instance you want this applied to
 * @param radius The radius of the pyramid convolved with the image.
 */
export const triangleBlur = (glfx: GLFX, radius: number) => {
  glfx.triangleBlurS =
    glfx.triangleBlurS ||
    new Shader(
      glfx,
      undefined,
      "\
        uniform sampler2D texture;\
        uniform vec2 delta;\
        varying vec2 texCoord;\
        " +
        randomShaderFunc +
        "\
        void main() {\
            vec4 color = vec4(0.0);\
            float total = 0.0;\
            \
            /* randomize the lookup values to hide the fixed number of samples */\
            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\
            \
            for (float t = -30.0; t <= 30.0; t++) {\
                float percent = (t + offset - 0.5) / 30.0;\
                float weight = 1.0 - abs(percent);\
                vec4 sample = texture2D(texture, texCoord + delta * percent);\
                \
                /* switch to pre-multiplied alpha to correctly blur transparent images */\
                sample.rgb *= sample.a;\
                \
                color += sample * weight;\
                total += weight;\
            }\
            \
            gl_FragColor = color / total;\
            \
            /* switch back from pre-multiplied alpha */\
            gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\
        }\
    "
    );

  glfx.simpleShader.call(glfx, glfx.triangleBlurS, {
    delta: [radius / glfx.width!, 0],
  });
  glfx.simpleShader.call(glfx, glfx.triangleBlurS, {
    delta: [0, radius / glfx.height!],
  });
};
