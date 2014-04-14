/* global app:false */
'use strict';

app.controller( 'MainController', [
    '$location',
    function ( $location ) {

      // Redirect to the homepage
      $location.path( 'home' );

    } );