/** select and play two diffent animations
 */
function play() {
    frameN = 0;
    if (!choice) {
        document.getElementById("myGLCanvas").classList.remove("back");
        // remove background

        illinois = context.newBuffer(loadlogo());
        // set the illinois logo buffer

        tick();
        // play
    }
    else {
        document.getElementById("myGLCanvas").classList.add("back");
        // enable the background

        illinois_3d = context.newBuffer(load3Dlogo());
        illinois_3d.scaleTo([.3, .3, .3]);
        // get the illinois 3D logo

        t = [0.004, 0.006, 0];
        // the translation vector

        tick();
        // play
    }
}

/** the second animation
 */
function animate1() {
    context.clean();
    var w = context.gl.viewportWidth;
    var h = context.gl.viewportHeight;
    illinois_3d.rotatex(.7);
    illinois_3d.rotatey(.3);
    var vertices = [ vec4.fromValues( 226/w,  327/h,  0    , 1),
                     vec4.fromValues( 226/w,  327/h,  120/w, 1),
                     vec4.fromValues(-226/w,  327/h,  0    , 1),
                     vec4.fromValues(-226/w,  327/h,  120/w, 1),
                     vec4.fromValues( 226/w, -327/h,  0    , 1),
                     vec4.fromValues( 226/w, -327/h,  120/w, 1),
                     vec4.fromValues(-226/w, -327/h,  0    , 1),
                     vec4.fromValues(-226/w, -327/h,  120/w, 1) ];
    // get 8 points value

    var maxn = [-1, -1, -1];
    var minx = [ 1,  1,  1];
    for (var i = 0; i < 8; i++) {
        var v = vec4.create();
        vec4.transformMat4(v, vertices[i], illinois_3d.mvMatrix);
        for (var j = 0; j < 3; j++){
            if (v[j] > maxn[j]) maxn[j] = v[j];
            if (v[j] < minx[j]) minx[j] = v[j];
        }
    }
    for (var j = 0; j < 3; j++) {
        if ((maxn[j] >= 1 && t[j] > 0) || (minx[j] <= -1 && t[j] < 0)) {
            t[j] = -t[j];
        }
    }
    // find max and minx value and change the direction of touch the wall
    illinois_3d.translate(t);
    illinois_3d.draw("TRIANGLES");
}

/** the first animation for mp1
 */
function animate0() {
    context.clean();
    illinois.draw("TRIANGLES");
    frameN = (frameN + 1) % 360;
    illinois.rotatez(2);
    // rotate

    s = Math.sin(frameN/180*Math.PI*2);
    illinois.setupBuffer(loadlogo(Math.abs(s)/3));
    // non-uniform

    illinois.scaleTo([Math.abs(s)*0.7 + 1,
                      Math.abs(s)*0.7 + 1,
                      Math.abs(s)*0.7 + 1]);
    // scale

    illinois.translateTo([Math.sin(frameN/180*Math.PI*2)/1.4 ,0, 0]);
    // translate
}

/** make anime frame
 */
function tick() {
    request = requestAnimFrame(tick);
    var anime = "animate" + choice;
    window[anime].call(this);
}
