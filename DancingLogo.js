/**
 * @file mp1 (Dancing Logo) for cs418
 * @author Jinsong Yuan <jinsong3@illinois.edu>
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the logo */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The translation matrix */
var translateMatrix = mat4.create();

/** @global The scale matrix */
var scaleMatrix = mat4.create();

/** @global The rotation matrix */
var rotateMatrix = mat4.create();

/** @global The Modelview matrix */
var mvMatrix = mat4.create();

/** @global The Projection matrix */
var pMatrix = mat4.create();

/** @global the number of frame */
var frameN = 0;

//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
}

/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var i = 0; i < names.length; i++) {
        try {
            context = canvas.getContext(names[i]);
        } catch(e) {}
        if (context) {
            break;
        }
    }
    // try to get context

    if (context) {
          console.log(canvas.style.width);
        context.viewportWidth = canvas.width;
        context.viewportHeight = canvas.height;
    } else {
        alert("Failed to create WebGL context! Please ensure your browser supports WebGL");
    }
    return context;
}

/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
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
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
    // load fragment and vertex shaders from DOM
    var vertexShader = loadShaderFromDOM("shader-vs");
    var fragmentShader = loadShaderFromDOM("shader-fs");

    // create a shader program and attach two shaders to it. Finally link it with our webGLv
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // check the program link status
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Failed to setup shaders!");
    }

    // bind the vertex variable
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    // bind the color variable
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
}

/**
 * load vertex buffer with data
 */
function loadVertices(bias) {
    // create the vertex buffer
    bias = bias || 0;
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    var w = gl.viewportWidth;
    var h = gl.viewportHeight;
    var [blue_y1, blue_y2, blue_x1, blue_x2] = [327/h, 151/h, 226/w + bias, 126/w];
    var [oran_y1, oran_y2, oran_x1, oran_x2] = [blue_y1 - 24/h, blue_y2 + 24/h, blue_x1 - 24/w, blue_x2 - 24/w];

    // set the vertex position
    var logoVertices = [
        -blue_x1,  blue_y1,  0.1,
         blue_x1,  blue_y1,  0.1,
        -blue_x1,  blue_y2,  0.1,
         blue_x1,  blue_y2,  0.1,
         blue_x1,  blue_y1,  0.1,
        -blue_x1,  blue_y2,  0.1,

        -blue_x2,  blue_y2,  0.1,
        -blue_x2, -blue_y2,  0.1,
         blue_x2,  blue_y2,  0.1,
         blue_x2, -blue_y2,  0.1,
        -blue_x2, -blue_y2,  0.1,
         blue_x2,  blue_y2,  0.1,

        -blue_x1, -blue_y1,  0.1,
         blue_x1, -blue_y1,  0.1,
        -blue_x1, -blue_y2,  0.1,
         blue_x1, -blue_y2,  0.1,
         blue_x1, -blue_y1,  0.1,
        -blue_x1, -blue_y2,  0.1,

        -oran_x1,  oran_y1,  0.0,
         oran_x1,  oran_y1,  0.0,
        -oran_x1,  oran_y2,  0.0,
         oran_x1,  oran_y2,  0.0,
         oran_x1,  oran_y1,  0.0,
        -oran_x1,  oran_y2,  0.0,

        -oran_x2,  oran_y2,  0.0,
        -oran_x2, -oran_y2,  0.0,
         oran_x2,  oran_y2,  0.0,
         oran_x2, -oran_y2,  0.0,
        -oran_x2, -oran_y2,  0.0,
         oran_x2,  oran_y2,  0.0,

        -oran_x1, -oran_y1,  0.0,
         oran_x1, -oran_y1,  0.0,
        -oran_x1, -oran_y2,  0.0,
         oran_x1, -oran_y2,  0.0,
         oran_x1, -oran_y1,  0.0,
        -oran_x1, -oran_y2,  0.0,

    ];

    // push to buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(logoVertices), gl.DYNAMIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numberOfItems = 36;
}

/**
 * populate color buffer with data
 */
function loadColors() {
    // create the color buffer
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

    // set the color
    var colors = [
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,

         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,

         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,
         0.075,  0.161,  0.294,  1.0,

         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,

         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,

         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
         0.910,  0.290,  0.153,  1.0,
    ]

    // push to buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 4;
    vertexColorBuffer.numItems = 36;
}

/**
 * Populate buffers with data
 */
function setupBuffers() {
    // generate the vertex positions
    loadVertices();

    // generate the vertex colors;
    loadColors();
}

/**
 * draw the model
 */
function draw() {
    // initial the canvas
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(mvMatrix);
    mat4.multiply(mvMatrix, scaleMatrix, mvMatrix);
    mat4.multiply(mvMatrix, rotateMatrix, mvMatrix);
    mat4.multiply(mvMatrix, translateMatrix, mvMatrix);
    // bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                           vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                           vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
 }

/**
 * initial for all matrixes
 */
function init() {
     mat4.identity(mvMatrix);
     mat4.identity(pMatrix);
     mat4.identity(translateMatrix);
     mat4.identity(scaleMatrix);
     mat4.identity(rotateMatrix);
 }

/** Translates the logo
 * @param {vec3} x, y, z bias value
 */
function translate(x) {
    mat4.translate(translateMatrix, translateMatrix, x);
}

/** Translates the center of logo to a certian position
 * @param {vec3} x, y, z value
 */
function translateTo(x) {
    mat4.identity(translateMatrix);
    translate(x);
}

/** Scale the logo
 * @param {vec3} number of the scale
 */
function scale(x) {
    mat4.scale(scaleMatrix, scaleMatrix, x);
}

/** Scale logo to a certian position
 * @param {Number} number of the scale
 */
function scaleTo(x) {
    mat4.identity(scaleMatrix);
    scale(x);
}

/** rotate the logo with a particular angle to z axis
 * @param {Number} degree of angle
 */
function rotatez(angle) {
    var rad = angle * Math.PI / 180;
    mat4.rotateZ(rotateMatrix, rotateMatrix, rad);
}

/**
 * Startup function called from html code to start program
 */
function startup() {
    // create WebGL object gl
    canvas = document.getElementById("myGLCanvas");
    gl = createGLContext(canvas);

    init();

    // initial shaders
    setupShaders();

    // initial buffers
    setupBuffers();

    // setup the background and use the depth test
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}

function animate1() {
    frameN = (frameN + 1) % 360;
    rotatez(2);

    s = Math.sin(frameN/180*Math.PI*2);
    loadVertices(Math.abs(s)/4);
    scaleTo([Math.abs(s) + 1, Math.abs(s) + 1, Math.abs(s) + 1]);
    translateTo([Math.sin(frameN/180*Math.PI*2)/2 ,0, 0])
}

function tick() {
    requestAnimFrame(tick);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw();
    animate1();
}
