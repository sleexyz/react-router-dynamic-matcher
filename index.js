"use strict";

var _require = require("react"),
    createClass = _require.createClass,
    createFactory = _require.createFactory,
    e = _require.createElement;

var _require2 = require("react-redux"),
    connect = _require2.connect;

require("redux-thunk");
require("redux");

var _makeRouteModifier = function _makeRouteModifier(indexRouteTransformer, childRoutesTransformer) {
  return function (getState, filter, branches, route) {
    route.getIndexRoute = function (_partialNextState, cb) {
      var state = getState();
      for (var i = 0; i < branches.length; i++) {
        var _branches$i = branches[i],
            _predicate = _branches$i.predicate,
            _indexRoute = _branches$i.indexRoute,
            _fallback = _branches$i.fallback,
            _name = _branches$i.name;

        if (_predicate(state)) {
          var _err = null;
          cb(_err, indexRouteTransformer(_indexRoute, filter, _predicate, _fallback, _name));
          return;
        }
      }
    };
    route.getChildRoutes = function (_partialNextState, cb) {
      var state = getState();
      for (var i = 0; i < branches.length; i++) {
        var _branches$i2 = branches[i],
            _predicate2 = _branches$i2.predicate,
            _childRoutes = _branches$i2.childRoutes,
            _fallback2 = _branches$i2.fallback,
            _name2 = _branches$i2.name;

        if (_predicate2(state)) {
          var _err2 = null;
          cb(_err2, childRoutesTransformer(_childRoutes, filter, _predicate2, _fallback2, _name2));
          return;
        }
      }
    };
  };
};

var makeGuard = function makeGuard(filter, predicate, fallback, name) {
  return connect(filter)(createClass({
    _check: function _check(props) {
      if (!predicate(props)) {
        var _dispatch = props.dispatch;

        _dispatch(fallback);
      }
    },

    displayName: name + 'Guard',
    componentWillMount: function componentWillMount() {
      this._check(this.props);
    },
    componentWillReceiveProps: function componentWillReceiveProps(props) {
      this._check(props);
    },
    render: function render() {
      return this.props.children;
    }
  }));
};

var Contain = function Contain(parent, child) {
  var Parent = createFactory(parent);
  var Child = createFactory(child);
  return function (_ref) {
    var children = _ref.children;

    return Parent({}, Child({}, children));
  };
};

var _modifyRouteGuarded = _makeRouteModifier(function (indexRoute, filter, predicate, fallback, name) {
  if (fallback === undefined) {
    throw new Error("fallback not declared for guarded matcher!");
  }
  var component = Contain(makeGuard(filter, predicate, fallback, name), indexRoute.component);
  component.displayName = name + "GuardContainer";
  return { component: component };
}, function (childRoutes, filter, predicate, fallback, name) {
  if (fallback === undefined) {
    throw new Error("fallback not declared for guarded matcher!");
  }
  var component = makeGuard(filter, predicate, fallback, name);
  return [{ childRoutes: childRoutes, component: component }];
});

var _modifyRouteUnguarded = _makeRouteModifier(function (x) {
  return x;
}, function (x) {
  return x;
});

var matcher = function matcher(_ref2) {
  var getStateRaw = _ref2.getState;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (branches) {
    return function (route) {
      var _options$filter = options.filter,
          filter = _options$filter === undefined ? function (x) {
        return x;
      } : _options$filter,
          _options$guard = options.guard,
          guard = _options$guard === undefined ? true : _options$guard;

      var getState = function getState() {
        return filter(getStateRaw());
      };
      if (guard) {
        _modifyRouteGuarded(getState, filter, branches, route);
      } else {
        _modifyRouteUnguarded(getState, filter, branches, route);
      }
      return route;
    };
  };
};

module.exports = matcher;

