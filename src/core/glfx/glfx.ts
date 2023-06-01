import type { Shader } from "./core/shader";
import { GLFXManager } from "./glfxManager";

export class GLFX extends GLFXManager {
  /** Compiled Shader Cache */
  /** Adjust Shaders */
  brightnessContrastS?: Shader;
  curvesS?: Shader;
  denoiseS?: Shader;
  exposureS?: Shader;
  hueSaturationS?: Shader;
  noiseS?: Shader;
  sepiaS?: Shader;
  unsharpMaskS?: Shader;
  vibranceS?: Shader;
  vignetteS?: Shader;
  /** Blur Shaders */
  lensBlurPrePass?: Shader;
  lensBlur0?: Shader;
  lensBlur1?: Shader;
  lensBlur2?: Shader;
  tiltShiftS?: Shader;
  triangleBlurS?: Shader;
  zoomBlurS?: Shader;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }
}
