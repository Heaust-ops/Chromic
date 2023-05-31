import type { GLFX } from "../glfx";

export class Shader {
  defaultVertexSource =
    "\
    attribute vec2 vertex;\
    attribute vec2 _texCoord;\
    letying vec2 texCoord;\
    void main() {\
        texCoord = _texCoord;\
        gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);\
    }";

  defaultFragmentSource =
    "\
    uniform sampler2D texture;\
    letying vec2 texCoord;\
    void main() {\
        gl_FragColor = texture2D(texture, texCoord);\
    }";

  glfx: GLFX;
  vertexAttribute: null;
  texCoordAttribute: null;
  program: WebGLProgram | null;

  constructor(glfx: GLFX, vertexSource?: string, fragmentSource?: string) {
    this.glfx = glfx;
    this.vertexAttribute = null;
    this.texCoordAttribute = null;

    this.program = this.glfx.gl.createProgram();

    vertexSource = vertexSource || this.defaultVertexSource;
    fragmentSource = fragmentSource || this.defaultFragmentSource;
    fragmentSource = "precision highp float;" + fragmentSource; // annoying requirement is annoying

    if (!this.program) return;
    glfx.gl.attachShader(
      this.program,
      this.compileSource(glfx.gl.VERTEX_SHADER, vertexSource)
    );
    glfx.gl.attachShader(
      this.program,
      this.compileSource(glfx.gl.FRAGMENT_SHADER, fragmentSource)
    );

    glfx.gl.linkProgram(this.program);
    if (!glfx.gl.getProgramParameter(this.program, glfx.gl.LINK_STATUS)) {
      throw "link error: " + glfx.gl.getProgramInfoLog(this.program);
    }
  }

  isArray(obj: unknown) {
    return Object.prototype.toString.call(obj) == "[object Array]";
  }

  isNumber(obj: unknown) {
    return Object.prototype.toString.call(obj) == "[object Number]";
  }

  compileSource(type: number, source: string) {
    const shader = this.glfx.gl.createShader(type);
    if (shader === null) throw new Error("Shader failed to be made");
    this.glfx.gl.shaderSource(shader, source);
    this.glfx.gl.compileShader(shader);
    if (!this.glfx.gl.getShaderParameter(shader, this.glfx.gl.COMPILE_STATUS)) {
      throw "compile error: " + this.glfx.gl.getShaderInfoLog(shader);
    }

    return shader;
  }

  destroy() {
    this.glfx.gl.deleteProgram(this.program);
    this.program = null;
  }

  uniforms(uniforms: { [x: string]: any; name: any }) {
    this.glfx.gl.useProgram(this.program);
    for (const name in uniforms) {
      if (!uniforms.name || !this.program) continue;
      const location = this.glfx.gl.getUniformLocation(this.program, name);
      if (location === null) continue; // will be null if the uniform isn't used in the shader
      const value = uniforms[name];
      if (this.isArray(value)) {
        switch (value.length) {
          case 1:
            this.glfx.gl.uniform1fv(location, new Float32Array(value));
            break;
          case 2:
            this.glfx.gl.uniform2fv(location, new Float32Array(value));
            break;
          case 3:
            this.glfx.gl.uniform3fv(location, new Float32Array(value));
            break;
          case 4:
            this.glfx.gl.uniform4fv(location, new Float32Array(value));
            break;
          case 9:
            this.glfx.gl.uniformMatrix3fv(
              location,
              false,
              new Float32Array(value)
            );
            break;
          case 16:
            this.glfx.gl.uniformMatrix4fv(
              location,
              false,
              new Float32Array(value)
            );
            break;
          default:
            throw (
              "dont't know how to load uniform \"" +
              name +
              '" of length ' +
              value.length
            );
        }
      } else if (this.isNumber(value)) {
        this.glfx.gl.uniform1f(location, value);
      } else {
        throw (
          'attempted to set uniform "' +
          name +
          '" to invalid value ' +
          (value || "undefined").toString()
        );
      }
    }

    return this;
  }

  textures(textures: { [x: string]: number; name: any }) {
    this.glfx.gl.useProgram(this.program);
    for (const name in textures) {
      if (!textures.name || !this.program) continue;
      this.glfx.gl.uniform1i(
        this.glfx.gl.getUniformLocation(this.program, name),
        textures[name]
      );
    }

    return this;
  }

  drawRect(left?: number, top?: number, right?: number, bottom?: number) {
    const viewport = this.glfx.gl.getParameter(this.glfx.gl.VIEWPORT);
    top = top !== undefined ? (top - viewport[1]) / viewport[3] : 0;
    left = left !== undefined ? (left - viewport[0]) / viewport[2] : 0;
    right = right !== undefined ? (right - viewport[0]) / viewport[2] : 1;
    bottom = bottom !== undefined ? (bottom - viewport[1]) / viewport[3] : 1;
    if (this.glfx.vertexBuffer == null) {
      this.glfx.vertexBuffer = this.glfx.gl.createBuffer();
    }
    this.glfx.gl.bindBuffer(this.glfx.gl.ARRAY_BUFFER, this.glfx.vertexBuffer);
    this.glfx.gl.bufferData(
      this.glfx.gl.ARRAY_BUFFER,
      new Float32Array([left, top, left, bottom, right, top, right, bottom]),
      this.glfx.gl.STATIC_DRAW
    );
    if (this.glfx.texCoordBuffer == null) {
      this.glfx.texCoordBuffer = this.glfx.gl.createBuffer();
      this.glfx.gl.bindBuffer(
        this.glfx.gl.ARRAY_BUFFER,
        this.glfx.texCoordBuffer
      );
      this.glfx.gl.bufferData(
        this.glfx.gl.ARRAY_BUFFER,
        new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
        this.glfx.gl.STATIC_DRAW
      );
    }
    if (this.vertexAttribute == null && this.program !== null) {
      this.glfx.vertexAttribute = this.glfx.gl.getAttribLocation(
        this.program,
        "vertex"
      );
      this.glfx.gl.enableVertexAttribArray(this.glfx.vertexAttribute);
    }
    if (this.texCoordAttribute == null && this.program !== null) {
      this.glfx.texCoordAttribute = this.glfx.gl.getAttribLocation(
        this.program,
        "_texCoord"
      );
      this.glfx.gl.enableVertexAttribArray(this.glfx.texCoordAttribute);
    }
    this.glfx.gl.useProgram(this.program);
    this.glfx.gl.bindBuffer(this.glfx.gl.ARRAY_BUFFER, this.glfx.vertexBuffer);
    this.glfx.gl.vertexAttribPointer(
      this.glfx.vertexAttribute,
      2,
      this.glfx.gl.FLOAT,
      false,
      0,
      0
    );
    this.glfx.gl.bindBuffer(
      this.glfx.gl.ARRAY_BUFFER,
      this.glfx.texCoordBuffer
    );
    this.glfx.gl.vertexAttribPointer(
      this.glfx.texCoordAttribute,
      2,
      this.glfx.gl.FLOAT,
      false,
      0,
      0
    );
    this.glfx.gl.drawArrays(this.glfx.gl.TRIANGLE_STRIP, 0, 4);
  }

  static getDefaultShader(glfx: GLFX) {
    glfx.defaultShader = glfx.defaultShader || new Shader(glfx);
    return glfx.defaultShader;
  }
}
