import { Shader } from "./core/shader";
import { GLFXManager } from "./glfxManager";

export const clamp = (lo: number, value: number, hi: number) => {
  return Math.max(lo, Math.min(value, hi));
};

export const warpShader = (
  glfx: GLFXManager,
  uniforms: string,
  warp: string
) => {
  return new Shader(
    glfx,
    undefined,
    `${uniforms}\
  uniform sampler2D texture;\
  uniform vec2 texSize;\
  varying vec2 texCoord;\
  void main() {\
      vec2 coord = texCoord * texSize;\
      ${warp}\
      gl_FragColor = texture2D(texture, coord / texSize);\
      vec2 clampedCoord = clamp(coord, vec2(0.0), texSize);\
      if (coord != clampedCoord) {\
          /* fade to transparent if we are outside the image */\
          gl_FragColor.a *= max(0.0, 1.0 - length(coord - clampedCoord));\
      }\
  }`
  );
};

// returns a random number between 0 and 1
export const randomShaderFunc =
  "\
  float random(vec3 scale, float seed) {\
      /* use the fragment position for a different seed per-pixel */\
      return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\
  }\
";
