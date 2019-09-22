/**
 * @file mp1 (Dancing Logo) for cs418
 * @author Jinsong Yuan <jinsong3@illinois.edu>
 */

/** @global The WebGL context */
var context;

/** @global the number of frame */
var frameN = 0;

/** @global the illinois logo buffer*/
var illinois;

/** @global the 3d illinois logo buffer*/
var illinois_3d;

/** @global the animation choice*/
var choice = 1;

/** @global request frame variable */
var request;

/** @gloabl translate direction */
var t = [0, 0, 0];


//-----------------------------------------------------------------------------

/**
 * Startup function called from html code to start program.
 */
function startup() {
    context = new GLcontext("myGLCanvas");
    //
    change_animation(0);
}


/**
 * change between two animations
 * @param {Number} Index of animation
 */
function change_animation(index) {
    if (choice == index) return;
    context.clean();
    choice = index;
    // change the animation

    cancelAnimFrame(request);
    // stop the last animation
    play();
}
