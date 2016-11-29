const {createClass, createFactory, createElement: e} = require("react");

const _makeRouteModifier = (indexRouteTransformer, childRoutesTransformer) => function (getState, branches, route) {
  route.getIndexRoute = (_partialNextState, cb) => {
    const state = getState();
    for (let {predicate, indexRoute, fallback, name} of branches) {
      if (predicate(state)) {
        const err = null;
        cb(err, indexRouteTransformer(indexRoute, getState, predicate, fallback, name));
        return;
      }
    }
  };
  route.getChildRoutes = (_partialNextState, cb) => {
    const state = getState();
    for (let {predicate, childRoutes, fallback, name} of branches) {
      if (predicate(state)) {
        const err = null;
        cb(err, childRoutesTransformer(childRoutes, getState, predicate, fallback, name));
        return;
      }
    }
  };
};

const Guard = (getState, predicate, fallback, name) => createClass({
  _check() {
    if (!predicate(getState())) {
      fallback();
    }
  },
  displayName: name + 'Guard',
  componentWillMount() {
    this._check();
  },
  componentWillReceiveProps(props) {
    this._check();
  },
  render() {
    return this.props.children;
  }
});

const Contain = (parent, child) => {
  const Parent = createFactory(parent);
  const Child = createFactory(child);
  return ({children}) => {
    return Parent({}, Child({}, children));
  };
};

const _modifyRouteGuarded = _makeRouteModifier(
  (indexRoute, getState, predicate, fallback, name) => {
    const component = Contain(Guard(getState, predicate, fallback, name), indexRoute.component);
    component.displayName = name + "GuardContainer";
    return {component};
  },
  (childRoutes, getState, predicate, fallback, name) => {
    const component = Guard(getState, predicate, fallback, name);
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
    _modifyRouteGuarded(getState, branches, route);
  } else {
    _modifyRouteUnguarded(getState, branches, route);
  }
  return route;
};

module.exports = matcher;
