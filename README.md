# ngBobril

The [Bobril](https://github.com/Bobris/Bobril) library can be used as a view component in web applications. ngBobril is an Angular module that allows Bobril Components to be used in [AngularJS](https://angularjs.org/) applications.

ngBobril is based on [ngReact](http://davidchang.github.io/ngBobril/) library

# Run example

```
bower install ngBobril
```

open examples\index.html in browser

# Usage

Then, just make sure Angular, Bobril, and ngBobril are on the page,
```
 <script src="../../bower_components/angular/angular.js"></script>
 <script src="../../bower_components/bobril/src/bobril.js"></script>
 <script src="../../ngBobril.min.js"></script>
```

and include the 'bobril' Angular module as a dependency for your new app

```
<script>
    angular.module('app', ['bobril']);
</script>
```

and you're good to go.

# Features

Specifically, ngBobril is composed of:

- `bobril-component`, an Angular directive that delegates off to a Bobril Component
- `bobrilDirective`, a service for converting Bobril components into the `bobril-component` Angular directive

**ngBobril** can be used in existing angular applications, to replace entire or partial views with bobril components.

## The bobril-component directive

The bobrilComponent directive is a generic wrapper for embedding your Bobril components.

With an Angular app and controller declaration like this:

```javascript
angular.module('app', ['bobril'])
  .controller('helloController', function($scope) {
    $scope.person = { fname: 'Jaroslav', lname: 'Kulhavy' };
  });
```

And a Bobril Component like this

```javascript
var Hello =  {
  render: function(ctx, me, oldMe) {
    me.tag = "div";
    me.children = "Hello " + ctx.data.fname + " " + ctx.data.lname;
  }
};
app.value( "Hello", Hello );
```

The component can be used in an Angular view using the bobril-component directive like so, where:

- the name attribute checks for an Angular injectable of that name and falls back to a globally exposed variable of the same name, and
- the data attribute indicates what scope properties should be exposed to the Bobril component

```html
<body ng-app="app">
  <div ng-controller="helloController">
    <bobril-component name="Hello" data="person" />
  </div>
</body>
```

## The bobrilDirective service

The bobrilDirective factory, in contrast to the bobrilComponent directive, is meant to create specific directives corresponding to Bobril components. In the background, this actually creates and sets up directives specifically bound to the specified Bobril component.

If, for example, you wanted to use the same Bobril component in multiple places, you'd have to specify &lt;bobril-component name="yourComponent" data="props" /&gt; repeatedly, but if you used bobrilDirective factory, you could create a yourComponent directive and simply use that everywhere.

The service takes the Bobril component as the argument.

```javascript
app.directive('hello', function(bobrilDirective) {
  return bobrilDirective(Hello);
});
```

Alternatively you can provide the name of the component

```javascript
app.directive('hello', function(bobrilDirective) {
  return bobrilDirective('Hello',  ["fname", "lname"]);
});
```

This creates a directive that can be used like this:

```html
<body ng-app="app">
  <div ng-controller="helloController">
    <hello fname="person.fname" lname="person.lname"/>
  </div>
</body>
```

The `bobrilDirective` service will watch attributes with these names you can pass in an array of attribute names to watch.

```javascript
app.directive('hello', function(bobrilDirective) {
  return bobrilDirective(HelloComponent, ['fname', 'lname']);
});
```

If you want to change the configuration of the directive created the `bobrilDirective` service, e.g. change `restrict: 'E'` to `restrict: 'C'`, you can do so by passing in an object literal with the desired configuration.

```javascript
app.directive('hello', function(bobrilDirective) {
  return bobrilDirective(HelloComponent, undefined, {restrict: 'C'});
});
```
