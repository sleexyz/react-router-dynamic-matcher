// @flow
const {createClass, createFactory, createElement: e} = require("react");
const {connect} = require("react-redux");
require("redux-thunk");
require("redux");

type Component = Object

type State = Object

type Store = Object

type Dispatch = Function

type Action = (
  dispatch : Dispatch,
  getState : () => State,
  extraArgument : any
)
  => void

type IndexRoute = {component : Component}

type Route = {
  component : Component,
  path? : string,
  getIndexRoute? : (_partialNextState : any, callback : (err : any, indexRoute : IndexRoute) => any) => void,
  getChildRoutes? : (_partialNextState : any, callback : (err : any, childRoutes : [Route]) => any) => void,
}

type Branch = {
  predicate : (state : State) => boolean,
  indexRoute : IndexRoute,
  childRoutes : [Route],
  fallback? : Action,
  name : string
}

type IndexRouteTransformer = (
  indexRoute : IndexRoute,
  filter : (state : State) => State,
  predicate : (state : State) => boolean,
  fallback? : Action,
  name : string
)
  => IndexRoute


type ChildRoutesTransformer = (
  childRoutes : [Route],
  filter : (state : State) => State,
  predicate : (state : State) => boolean,
  fallback? : Action,
  name : string
)
  => [Route]


type RouteModifier = (
  getState : () => State,
  filter : (state : State) => State,
  branches : [Branch],
  route : Route
)
  => void

const _makeRouteModifier :
(
  irt : IndexRouteTransformer,
  crt : ChildRoutesTransformer
)
  => RouteModifier
= (indexRouteTransformer, childRoutesTransformer) => function (getState, filter, branches, route) {
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

const makeGuard :
(
  filter : (state : State) => State,
  predicate : (state : State) => boolean,
  fallback : Action,
  name : string
)
  => Component
= (filter, predicate, fallback, name) => connect(filter)(createClass({
  _check(props) {
    if (!predicate(props)) {
      const {dispatch} = props;
      dispatch(fallback);
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

const Contain :
(
  parent : Component,
  child : Component
)
  => Component
= (parent, child) => {
  const Parent = createFactory(parent);
  const Child = createFactory(child);
  return ({children}) => {
    return Parent({}, Child({}, children));
  };
};


const _modifyRouteGuarded :
RouteModifier
= _makeRouteModifier(
  (indexRoute, filter, predicate, fallback, name) => {
    if (fallback === undefined) {
      throw new Error("fallback not declared for guarded matcher!");
    }
    const component = Contain(makeGuard(filter, predicate, fallback, name), indexRoute.component);
    component.displayName = name + "GuardContainer";
    return {component};
  },
  (childRoutes, filter, predicate, fallback, name) => {
    if (fallback === undefined) {
      throw new Error("fallback not declared for guarded matcher!");
    }
    const component = makeGuard(filter, predicate, fallback, name);
    return [{childRoutes, component}];
  }
);

const _modifyRouteUnguarded :
RouteModifier
= _makeRouteModifier((x) => x, (x) => x);

type Options = {
  filter? : (state : State) => State,
  guard? : boolean
}

const matcher :
(store : Store, options? : Options)
  => (branches : [Branch])
  => (route : Route)
  => Route
= ({getState: getStateRaw}, options={}) => (branches) => (route) => {
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
