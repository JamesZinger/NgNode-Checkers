/* global app:false */
/* global $:false */
'use strict';

app.controller( 'HomeController', function ( $scope ) {

  // Change the nav button to highlight this page in the navbar
  $( '.navbar-nav > li' ).removeClass( 'active' );
  $( '#nav-home' ).addClass( 'active' );

  // Set the ngView class for this page
  $scope.pageClass = 'view-home';

  /*

  // Clear the username field when the user clicks on it and replace the default
  // text if the user doesn't type in a name.
  $scope.username = model.username;
  var usernameField = $( '#input-username' );
  usernameField.val( model.username );
  usernameField.on( 'click focusin', function () {
    if ( this.value === defaults.username ) {
      this.value = '';
    }
  } );
  usernameField.on( 'focusout', function () {
    if ( this.value === '' ) {
      this.value = defaults.username;
    }
  } );

  // Push the username in the scope into the global username on click
  var playButton = $( '.jumbotron .btn' );
  playButton.on( 'click', function () {
    model.username = $scope.username;
  } );

  */

} );