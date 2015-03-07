var app = angular.module( 'app', ['bobril'] );

app.controller( 'mainCtrl', function( $scope ) {
  $scope.person = { fname: 'Jaroslav', lname: 'Kulhavy' };
} );

var Hello =  {
  render: function(ctx, me, oldMe) {
    me.tag = "p";
    me.children = "Hello " + ctx.data.fname + " " + ctx.data.lname;
  }
};

app.value( "Hello", Hello );

app.directive( 'hello', function( bobrilDirective ) {
  return bobrilDirective( "Hello" , ["fname", "lname"]);
} );