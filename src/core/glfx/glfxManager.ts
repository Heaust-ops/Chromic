import { Shader } from "./core/shader";
import { Texture } from "./core/texture";

export class GLFXManager {
  vertexAttribute: number;
  texCoordAttribute: number;
  texCoordBuffer: WebGLBuffer | null;
  vertexBuffer: WebGLBuffer | null;
  framebuffer: WebGLBuffer | null;
  defaultShader?: Shader;
  gl: WebGLRenderingContext;
  texture?: Texture;
  spareTexture?: Texture;
  width?: number;
  height?: number;
  extraTexture?: Texture;
  flippedShader?: Shader;
  isInitialized: boolean;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.texCoordBuffer = null;
    this.vertexBuffer = null;
    this.framebuffer = null;
    this.vertexAttribute = 0;
    this.texCoordAttribute = 0;
    this.isInitialized = false;
    this.canvas = canvas;

    this.gl = canvas.getContext("webgl", { premultipliedAlpha: false })! as WebGLRenderingContext;
    if (!this.gl) throw new Error("couldn't make webgl context");
    this.initialize(canvas.width, canvas.height);
  }

  initialize(width: number, height: number) {
    let type = this.gl.UNSIGNED_BYTE as number;
    const gl = this.gl;

    // Go for floating point buffer textures if we can, it'll make the bokeh
    // filter look a lot better. Note that on Windows, ANGLE does not let you
    // render to a floating-point texture when linear filtering is enabled.
    // See https://crbug.com/172278 for more information.
    if (
      this.gl.getExtension("OES_texture_float") &&
      this.gl.getExtension("OES_texture_float_linear")
    ) {
      const testTexture = new Texture(
        this,
        100,
        100,
        this.gl.RGBA,
        this.gl.FLOAT
      );
      try {
        // Only use gl.FLOAT if we can render to it
        testTexture.drawTo(function () {
          type = gl.FLOAT;
        });
      } catch (e) {
        console.log(e);
      }
      testTexture.destroy();
    }

    if (this.texture) this.texture.destroy();
    if (this.spareTexture) this.spareTexture.destroy();
    this.width = width;
    this.height = height;
    this.texture = new Texture(this, width, height, this.gl.RGBA, type);
    this.spareTexture = new Texture(this, width, height, this.gl.RGBA, type);
    this.extraTexture =
      this.extraTexture || new Texture(this, 0, 0, this.gl.RGBA, type);
    this.flippedShader =
      this.flippedShader ||
      new Shader(
        this,
        undefined,
        "\
        uniform sampler2D texture;\
        varying vec2 texCoord;\
        void main() {\
            gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));\
        }\
    "
      );
    this.isInitialized = true;
  }

  draw(texture: Texture, width?: number, height?: number) {
    if (
      !this.isInitialized ||
      texture.width != this.width ||
      texture.height != this.height
    ) {
      this.initialize.call(
        this,
        width ? width : texture.width,
        height ? height : texture.height
      );
    }

    texture.use();
    const glfx = this;
    this.texture?.drawTo(function () {
      Shader.getDefaultShader(glfx).drawRect();
    });

    return this;
  }

  update() {
    this.texture?.use();
    this.flippedShader?.drawRect();
    return this;
  }

  simpleShader(
    shader: Shader,
    uniforms: { [x: string]: any; name?: any },
    textureIn?: Texture,
    textureOut?: Texture
  ) {
    (textureIn || this.texture)?.use();
    this.spareTexture?.drawTo(function () {
      shader.uniforms(uniforms).drawRect();
    });
    this.spareTexture?.swapWith((textureOut || this.texture) as Texture);
  }

  replace(node: HTMLElement) {
    node.parentNode?.insertBefore(this.canvas, node);
    node.parentNode?.removeChild(node);
    return this;
  }

  contents() {
    const texture = new Texture(
      this,
      this.texture?.width ?? 0,
      this.texture?.height ?? 0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE
    );
    this.texture?.use();
    const glfx = this;
    texture.drawTo(function () {
      Shader.getDefaultShader(glfx).drawRect();
    });

    return texture;
  }

  getPixelArray() {
    const w = this.texture?.width ?? 0;
    const h = this.texture?.height ?? 0;
    const array = new Uint8Array(w * h * 4);
    const gl = this.gl;
    this.texture?.drawTo(function () {
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, array);
    });
    return array;
  }
}
