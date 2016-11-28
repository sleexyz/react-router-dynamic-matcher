const _makeModifyRoute = (indexRouteTransformer, childRouteTransformer) => function (getState, branches, route) {
  route.getIndexRoute = (_partialNextState, cb) => {
    const state = getState();
    for (let {predicate, indexRoute} of branches) {
      if (predicate(state)) {
        const err = null;
        cb(err, indexRouteTransformer(indexRoute));
        return;
      }
    }
  };

  route.getChildRoutes = (_partialNextState, cb) => {
    const state = getState();
    for (let {predicate, childRoutes} of branches) {
      if (predicate(state)) {
        const err = null;
        cb(err, childRoutesTransformer(childRoutes));
        return;
      }
    }
  };
};

const identity = (x) => x;
const _modifyRouteUnguarded = _makeModifyRoute(identity, identity);
const _modifyRouteGuarded = _makeModifyRoute(
  (indexRoute) => {
    throw new Error("TODO: Implement indexRoute guarding transformer");
    return indexRoute;
  },
  (childRoute) => {
    throw new Error("TODO: Implement childRoutes guarding transformer");
    return childRoute;
  }
);


const dynamic = (getStateRaw, options={}) => (branches) => (route) => {
  const {
    filter = identity,
    guard = true//TODO: implement
  } = options;

  const getState = () => filter(getStateRaw());

  if (guard) {
    _modifyRouteGuarded(getState, branches, route);
  } else {
    _modifyRouteUnguarded(getState, branches, route);
  }

  return route;
};

module.exports = dynamic;
