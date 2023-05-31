import { Shader } from "./core/shader";
import { GLFXManager } from "./glfxManager";
import { clamp } from "./utils";

export class GLFX extends GLFXManager {
  brightnessContrastS?: Shader;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  /**
   * ADJUST
   */

  brightnessContrast(brightness: number, contrast: number) {
    this.brightnessContrastS =
      this.brightnessContrastS ||
      new Shader(
        this,
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

    this.simpleShader.call(this, this.brightnessContrastS, {
      brightness: clamp(-1, brightness, 1),
      contrast: clamp(-1, contrast, 1),
    });
    
    return this;
  }
}
