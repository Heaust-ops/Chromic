import type { Shader } from "./core/shader";

export class GLFX {
  vertexAttribute: number;
  texCoordAttribute: number;
  texCoordBuffer: WebGLBuffer | null;
  vertexBuffer: WebGLBuffer | null;
  framebuffer: WebGLBuffer | null;
  defaultShader?: Shader;
  gl: WebGLRenderingContext;

  constructor(canvas: HTMLCanvasElement) {
    this.texCoordBuffer = null;
    this.vertexBuffer = null;
    this.framebuffer = null;
    this.vertexAttribute = 0;
    this.texCoordAttribute = 0;

    this.gl = canvas.getContext("webgl", { premultipliedAlpha: false })!;
    if (!this.gl) throw new Error("couldn't make webgl context");
  }
}
