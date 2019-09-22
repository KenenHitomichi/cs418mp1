// A class for webGL object
class GLcontext {
    /** the webGL object */
    gl;

    /** the program of shader*/
    shaderProgram;

    /**
     * constructor function of GLcontext
     * @param {string} ID of canvas in DOM
     */
    constructor(id) {
        // read canvas from DOM and get webGL object
        var canvas = document.getElementById(id);
        this.gl = this.createGLContext(canvas);

        // setup vertex and fragment shaders
        this.setupShaders();

        // initial the canvas
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);
        this.gl.clearColor(1.0, 1.0, 1.0, 0.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    }

    createGLContext(canvas) {
        var names = ["webgl", "experimental-webgl"];
        var context = null;
        var context_options = {
            //this enables an alpha channnel in rendering buffer
            alpha: true,
            stencil: false,
            antialias: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false
        };

        for (var i = 0; i < names.length; i++) {
            try {
                context = canvas.getContext(names[i], context_options);
            } catch(e) {}
            if (context) {
                break;
            }
        }
        // try to get context

        if (context) {
            context.viewportWidth = canvas.width;
            context.viewportHeight = canvas.height;
        } else {
            alert("Failed to create WebGL context! Please ensure your browser supports WebGL");
        }
        return context;
    }

    setupShaders() {
        // load fragment and vertex shaders from DOM
        var vertexShader = this.loadShaderFromDOM("shader-vs");
        var fragmentShader = this.loadShaderFromDOM("shader-fs");

        // create a shader program and attach two shaders to it. Finally link it with our webGLv
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        // check the program link status
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            alert("Failed to setup shaders!");
        }

        // bind the vertex variable
        this.gl.useProgram(this.shaderProgram);
        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);

        // bind the color variable
        this.shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexColor");
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);

        this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");

    }

    loadShaderFromDOM(id) {
      var shaderScript = document.getElementById(id);

      // If we don't find an element with the specified id
      // we do an early exit
      if (!shaderScript) {
        return null;
      }

      // Loop through the children for the found DOM element and
      // build up the shader source code as a string
      var shaderSource = "";
      var currentChild = shaderScript.firstChild;
      while (currentChild) {
        if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
          shaderSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
      }

      var shader;
      if (shaderScript.type == "x-shader/x-fragment") {
        shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = this.gl.createShader(this.gl.VERTEX_SHADER);
      } else {
        return null;
      }

      this.gl.shaderSource(shader, shaderSource);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        alert(this.gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    clean() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    newBuffer(x) {
        var newBuff = new GLBuffer(this.gl, this.shaderProgram);
        newBuff.setupBuffer(x);
        return newBuff;
    }
}

/** class for webGL buffers */
class GLBuffer{
    /** Vertex Buffers*/
    vertexPositionBuffer;
    vertexColorBuffer;

    /** affine matrix*/
    translateMatrix;
    scaleMatrix;
    rotateMatrix;
    mvMatrix;

    /** projection matrix*/
    pMatrix;

    /** WebGL object and shader program */
    gl;
    shaderProgram;

    /**
     * constructor function of GLcontext
     * @param {webglObject, shaderProgram} the webgl boject and the program
     */
    constructor(context, shaderP) {
        this.gl = context;
        this.shaderProgram = shaderP;
        // copy the object and program

        this.scaleMatrix = mat4.create();
        this.rotateMatrix = mat4.create();
        this.pMatrix = mat4.create();
        this.translateMatrix = mat4.create();
        this.mvMatrix = mat4.create();
        // create matrix

        this.initial();
        // initial matrix
    }

    /**
     * identity matrix
     */
    initial() {
        mat4.identity(this.mvMatrix);
        mat4.identity(this.pMatrix);
        mat4.identity(this.translateMatrix);
        mat4.identity(this.scaleMatrix);
        mat4.identity(this.rotateMatrix);
    }

    /**
     * Set up Buffers
     * @param {vec3} vertices numbers, vertices array and color array
     */
    setupBuffer(x) {
        var [vnum, varr, carr] = x;
        this.loadVertices([vnum, varr]);
        this.loadColors([vnum, carr])
    }

    /**
     * load vertices to buffers
     * @param {vec2} vertices numbers, vertices array
     */
    loadVertices(x) {
        var [vnum, arr] = x;
        this.vertexPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.DYNAMIC_DRAW);
        this.vertexPositionBuffer.itemSize = 3;
        this.vertexPositionBuffer.numberOfItems = vnum;
    }

    /**
     * load color to buffers
     * @param {vec2} vertices numbers, color array
     */
    loadColors(x) {
        var [vnum, arr] = x;
        this.vertexColorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.STATIC_DRAW);
        this.vertexColorBuffer.itemSize = 4;
        this.vertexColorBuffer.numberOfItems = vnum;
    }

    /**
     * draw the frame
     * @param {string} Type of gl draw
     */
    draw(s) {
        mat4.identity(this.mvMatrix);
        mat4.multiply(this.mvMatrix, this.scaleMatrix, this.mvMatrix);
        mat4.multiply(this.mvMatrix, this.rotateMatrix, this.mvMatrix);
        mat4.multiply(this.mvMatrix, this.translateMatrix, this.mvMatrix);
        // get movement matrix

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
                               this.vertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexColorBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute,
                               this.vertexColorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        // enable vertex and color buffers

        this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
        this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
        // bind movement and projection matrix

        var h;
        if (s == "TRIANGLES") h = this.gl.TRIANGLES;
        else if (s == "TRIANGLE_FAN") h = this.gl.TRIANGLE_FAN;
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexPositionBuffer.numberOfItems);
        // draw to the screen
    }

    /** Translates the logo
     * @param {vec3} x, y, z bias value
     */
    translate(x) {
        mat4.translate(this.translateMatrix, this.translateMatrix, x);
    }

    /** Translates the center of logo to a certian position
     * @param {vec3} x, y, z value
     */
    translateTo(x) {
        mat4.identity(this.translateMatrix);
        this.translate(x);
    }

    /** Scale the logo
     * @param {vec3} number of the scale
     */
    scale(x) {
        mat4.scale(this.scaleMatrix, this.scaleMatrix, x);
    }

    /** Scale logo to a certian position
     * @param {Number} number of the scale
     */
    scaleTo(x) {
        mat4.identity(this.scaleMatrix);
        this.scale(x);
    }

    /** rotate the logo with a particular angle to z axis
     * @param {Number} degree of angle
     */
    rotatez(angle) {
        var rad = angle * Math.PI / 180;
        mat4.rotateZ(this.rotateMatrix, this.rotateMatrix, rad);
    }

    /** rotate the logo with a particular angle to x axis
     * @param {Number} degree of angle
     */
    rotatex(angle) {
        var rad = angle * Math.PI / 180;
        mat4.rotateX(this.rotateMatrix, this.rotateMatrix, rad);
    }

    /** rotate the logo with a particular angle to y axis
     * @param {Number} degree of angle
     */
    rotatey(angle) {
        var rad = angle * Math.PI / 180;
        mat4.rotateY(this.rotateMatrix, this.rotateMatrix, rad);
    }
}
