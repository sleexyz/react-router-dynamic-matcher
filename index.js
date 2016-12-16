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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = branches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _step.value,
              _predicate = _step$value.predicate,
              _indexRoute = _step$value.indexRoute,
              _fallback = _step$value.fallback,
              _name = _step$value.name;

          if (_predicate(state)) {
            var _err = null;
            cb(_err, indexRouteTransformer(_indexRoute, filter, _predicate, _fallback, _name));
            return;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    };
    route.getChildRoutes = function (_partialNextState, cb) {
      var state = getState();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = branches[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = _step2.value,
              _predicate2 = _step2$value.predicate,
              _childRoutes = _step2$value.childRoutes,
              _fallback2 = _step2$value.fallback,
              _name2 = _step2$value.name;

          if (_predicate2(state)) {
            var _err2 = null;
            cb(_err2, childRoutesTransformer(_childRoutes, filter, _predicate2, _fallback2, _name2));
            return;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
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

