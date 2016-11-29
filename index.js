const {createClass, createFactory, createElement: e} = require("react");
const {connect} = require("react-redux");
require("redux-thunk");
require("redux");

const _makeRouteModifier = (indexRouteTransformer, childRoutesTransformer) => function (getState, filter, branches, route) {
  route.getIndexRoute = (_partialNextState, cb) => {
    const state = getState();
    for (let {predicate, indexRoute, fallback, name} of branches) {
      if (predicate(state)) {
        const err = null;
        cb(err, indexRouteTransformer(indexRoute, filter, predicate, fallback, name));
        return;
      }
    }
  };
  route.getChildRoutes = (_partialNextState, cb) => {
    const state = getState();
    for (let {predicate, childRoutes, fallback, name} of branches) {
      if (predicate(state)) {
        const err = null;
        cb(err, childRoutesTransformer(childRoutes, filter, predicate, fallback, name));
        return;
      }
    }
  };
};

const makeGuard = (filter, predicate, fallback, name) => connect(filter)(createClass({
  _check(props) {
    if (!predicate(props)) {
      fallback();
    }
  },
  displayName: name + 'Guard',
  componentWillMount() {
    this._check(this.props);
  },
  componentWillReceiveProps(props) {
    this._check(props);
  },
  render() {
    return this.props.children;
  }
}));

const Contain = (parent, child) => {
  const Parent = createFactory(parent);
  const Child = createFactory(child);
  return ({children}) => {
    return Parent({}, Child({}, children));
  };
};

const _modifyRouteGuarded = _makeRouteModifier(
  (indexRoute, filter, predicate, fallback, name) => {
    const component = Contain(makeGuard(filter, predicate, fallback, name), indexRoute.component);
    component.displayName = name + "GuardContainer";
    return {component};
  },
  (childRoutes, filter, predicate, fallback, name) => {
    const component = makeGuard(filter, predicate, fallback, name);
    return [{childRoutes, component}];
  }
);

const _modifyRouteUnguarded = _makeRouteModifier((x) => x, (x) => x);

const matcher = (getStateRaw, options={}) => (branches) => (route) => {
  const {
    filter = (x) => x,
    guard = true
  } = options;
  const getState = () => filter(getStateRaw());
  if (guard) {
    _modifyRouteGuarded(getState, filter, branches, route);
  } else {
    _modifyRouteUnguarded(getState, filter, branches, route);
  }
  return route;
};

module.exports = matcher;
