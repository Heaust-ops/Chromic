import type { GLFXManager } from "../glfxManager";
import { Shader } from "./shader";

export class Texture {
  glfx: GLFXManager;
  gl: WebGLRenderingContext;
  id: WebGLTexture | null;
  width: number;
  height: number;
  format: number;
  type: number;
  canvas: HTMLCanvasElement | null;

  constructor(
    glfx: GLFXManager,
    width: number,
    height: number,
    format: number,
    type: number
  ) {
    this.glfx = glfx;
    this.gl = glfx.gl;
    this.id = this.gl.createTexture();
    this.width = width;
    this.height = height;
    this.format = format;
    this.type = type;
    this.canvas = null;

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    if (width && height)
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.format,
        width,
        height,
        0,
        this.format,
        this.type,
        null
      );
  }

  loadContentsOf(element: HTMLImageElement | HTMLVideoElement) {
    this.width =
      (element as HTMLImageElement).naturalWidth ||
      (element as HTMLVideoElement).videoWidth;
    this.height =
      (element as HTMLImageElement).naturalHeight ||
      (element as HTMLVideoElement).videoHeight;

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.format,
      this.format,
      this.type,
      element
    );
  }

  initFromBytes(width: number, height: number, data: Iterable<number>) {
    this.width = width;
    this.height = height;
    this.format = this.gl.RGBA;
    this.type = this.gl.UNSIGNED_BYTE;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      width,
      height,
      0,
      this.gl.RGBA,
      this.type,
      new Uint8Array(data)
    );
  }

  destroy() {
    this.gl.deleteTexture(this.id);
    this.id = null;
  }

  use(unit?: number) {
    this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0));
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
  }

  unuse(unit?: number) {
    this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0));
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  ensureFormat(
    width: number | Texture,
    height: number,
    format: number,
    type: number
  ) {
    // allow passing an existing texture instead of individual arguments
    if (arguments.length == 1) {
      const texture = width as Texture;
      width = texture.width;
      height = texture.height;
      format = texture.format;
      type = texture.type;
    }

    // change the format only if required
    if (
      width != this.width ||
      height != this.height ||
      format != this.format ||
      type != this.type
    ) {
      this.width = width as number;
      this.height = height;
      this.format = format;
      this.type = type;
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.format,
        width as number,
        height,
        0,
        this.format,
        this.type,
        null
      );
    }
  }

  drawTo(callback: Function) {
    // start rendering to this texture
    this.glfx.framebuffer =
      this.glfx.framebuffer || this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.glfx.framebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.id,
      0
    );
    if (
      this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !==
      this.gl.FRAMEBUFFER_COMPLETE
    ) {
      throw new Error("incomplete framebuffer");
    }
    this.gl.viewport(0, 0, this.width, this.height);

    // do the drawing
    callback();

    // stop rendering to this texture
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  getCanvas(texture: Texture) {
    if (this.canvas == null) this.canvas = document.createElement("canvas");
    this.canvas.width = texture.width;
    this.canvas.height = texture.height;
    const c = this.canvas.getContext("2d");
    if (!c) throw new Error("couldn't get 2d context");
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return c;
  }

  fillUsingCanvas(callback: Function) {
    callback(this.getCanvas(this));
    this.format = this.gl.RGBA;
    this.type = this.gl.UNSIGNED_BYTE;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      this.canvas!
    );
    return this;
  }

  toImage(image: HTMLImageElement | HTMLVideoElement) {
    this.use();
    Shader.getDefaultShader(this.glfx).drawRect();
    const size = this.width * this.height * 4;
    const pixels = new Uint8Array(size);
    const c = this.getCanvas(this);
    const data = c.createImageData(this.width, this.height);
    this.gl.readPixels(
      0,
      0,
      this.width,
      this.height,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      pixels
    );
    for (let i = 0; i < size; i++) {
      data.data[i] = pixels[i];
    }
    c.putImageData(data, 0, 0);
    image.src = this.canvas!.toDataURL();
  }

  swapWith(other: Texture) {
    let temp;
    temp = other.id;
    other.id = this.id;
    this.id = temp;
    temp = other.width;
    other.width = this.width;
    this.width = temp;
    temp = other.height;
    other.height = this.height;
    this.height = temp;
    temp = other.format;
    other.format = this.format;
    this.format = temp;
  }

  static fromElement(
    glfx: GLFXManager,
    element: HTMLImageElement | HTMLVideoElement
  ) {
    const texture = new Texture(
      glfx,
      0,
      0,
      glfx.gl.RGBA,
      glfx.gl.UNSIGNED_BYTE
    );
    texture.loadContentsOf(element);
    return texture;
  }
}
