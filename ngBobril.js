// # ngBobril
// ### Use Bobril components inside of your Angular applications
//
// Composed of
// - bobrilComponent (generic directive for delegating off to Bobril Components)
// - bobrilDirective (factory for creating specific directives that correspond to bobrilComponent directives)


(function (root, factory) {
  if (!b) { throw Error('Cannot find bobril library'); }
 
  b.init(function () { return false; });
     // Already resolved
   if (root.b != 'undefined' && root.angular != 'undefined') {
        root.ngBobril = factory(root.b, root.angular);
    } else {
        throw new Error('Unable to resolve dependencies');
    }

}(this, function ngBobril(b, angular) {
  'use strict';

  // get a bobril component from name (components can be an angular injectable e.g. value, factory or
  // available on window
  function getBobrilComponent( name, $injector ) {
    // if name is a function assume it is component and return it
    if (angular.isFunction(name)) {
      return name;
    }

    // a Bobril component name must be specified
    if (!name) {
      throw new Error('BobrilComponent name attribute must be specified');
    }

    // ensure the specified Bobril component is accessible, and fail fast if it's not
    var bobrilComponent;
    try {
      bobrilComponent = $injector.get(name);
    } catch(e) { }

    if (!bobrilComponent) {
      try {
        bobrilComponent = name.split('.').reduce(function(current, namePart) {
          return current[namePart];
        }, window);
      } catch (e) { }
    }

    if (!bobrilComponent) {
      throw Error('Cannot find bobril component ' + name);
    }

    return bobrilComponent;
  }

  // wraps a function with scope.$apply, if already applied just return
  function applied(fn, scope) {
    if (fn.wrappedInApply) {
      return fn;
    }
    return function() {
      var args = arguments;
      scope.$apply(function() {
        fn.wrappedInApply = true;
        fn.apply( null, args );
      });
    };
  }

  // wraps all functions on obj in scope.$apply
  function applyFunctions(obj, scope) {
    return Object.keys(obj || {}).reduce(function(prev,key) {
      var value = obj[key];
      // wrap functions in a function that ensures they are scope.$applied
      // ensures that when function is called from a Bobril component
      // the Angular digest cycle is run
      prev[key] = angular.isFunction(value) ? applied(value, scope) : value;
      return prev;
    }, {});
  }

  // render Bobril component, with scope[attrs.props] being passed in as the component props
  function renderComponent(component, data, $timeout, elem) {  //props->data
    $timeout(function() {
      var elm = elem[0];
      if (elm.id)
        b.removeRoot(elm.id);
      elm.id = b.addRoot(function() {
          return {
            tag: "div",
            data: data,
            component: component
          }
        }, elm);
    });
  }

  // # bobrilComponent
  // Directive that allows Bobril components to be used in Angular templates.
  //
  // Usage:
  //     <bobril-component name="Hello" data="name"/>
  //
  // This requires that there exists an injectable or globally available 'Hello' Bobril component.
  // The 'data' attribute is optional and is passed to the component.
  //
  // The following would would create and register the component:
  //
  // var Hello =  {
  // render: function(ctx, me, oldMe) {
  //    me.tag = "div";
  //    me.children = "Hello " + ctx.data.name;
  // }};
  //
  var bobrilComponent = function($timeout, $injector) {
    return {
      restrict: 'E',
      replace: true,
      link: function(scope, elem, attrs) {
        var bobrilComponent = getBobrilComponent(attrs.name, $injector);

        var renderMyComponent = function() {
          var scopeData = scope.$eval(attrs.data);
          var data = applyFunctions(scopeData, scope);

          renderComponent(bobrilComponent, data, $timeout, elem);
        };

        // If there are data, re-render when they change
        attrs.data ?
          scope.$watch(attrs.data, renderMyComponent, true) :
          renderMyComponent();

        // cleanup when scope is destroyed
        scope.$on('$destroy', function() {
          if (elem[0] && elem[0].id)
            b.removeRoot(elem[0].id);
        });
      }
    };
  };

  // # bobrilDirective
  // Factory function to create directives for Bobril components.
  //
  // With a component like this:
  //
  // var Hello =  {
  // render: function(ctx, me, oldMe) {
  //    me.tag = "div";
  //    me.children = "Hello " + ctx.data.name;
  // }};
  //
  // A directive can be created and registered with:
  //
  //     module.directive('hello', function(bobrilDirective) {
  //         return bobrilDirective('Hello', ['name']);
  //     });
  //
  // Where the first argument is the injectable or globally accessible name of the Bobril component
  // and the second argument is an array of property names to be watched and passed to the Bobril component
  // as data.
  //
  // This directive can then be used like this:
  //
  //     <hello name="name"/>
  //
  var bobrilDirective = function($timeout, $injector) {
    return function(bobrilComponentName, propNames, conf) {
      var directive = {
        restrict: 'E',
        replace: true,
        link: function(scope, elem, attrs) {
          var bobrilComponent = getBobrilComponent(bobrilComponentName, $injector);

          propNames = propNames || {};

          // for each of the properties, get their scope value and set it to scope.props
          var renderMyComponent = function() {
            var data = {};
            propNames.forEach(function(propName) {
              data[propName] = scope.$eval(attrs[propName]);
            });
            renderComponent(bobrilComponent, applyFunctions(data, scope), $timeout, elem);
          };

          // watch each property name and trigger an update whenever something changes,
          // to update scope.props with new values
          propNames.forEach(function(k) {
            
            scope.$watch(attrs[k], 
              function(oldValue, newValue, scope){
                renderMyComponent();
            }, true);
          });

          renderMyComponent();

          // cleanup when scope is destroyed
          scope.$on('$destroy', function() {
            if (elem[0] && elem[0].id)
              b.removeRoot(elem[0].id);
          });
        }
      };
      return angular.extend(directive, conf);
    };
  };

  // create the end module without any dependencies, including bobrilComponent and bobrilDirective
  return angular.module('bobril', [])
    .directive('bobrilComponent', ['$timeout', '$injector', bobrilComponent])
    .factory('bobrilDirective', ['$timeout','$injector', bobrilDirective]);

}));
