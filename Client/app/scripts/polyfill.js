'use strict';

// Provides browser support for requestAnimationFrame() since THREE considers
// requestAnimationFrame() best-practice for running the render loop. Also has
// a fallback to use setTimeout if no other option is available.
// Source: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = ( function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function ( callback ) {
      window.setTimeout( callback, 1000 / 60 );
    };
} )();