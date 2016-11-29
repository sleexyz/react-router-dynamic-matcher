const React = require("react");
const { Router, hashHistory } = require("react-router");
const { render } = require("react-dom");
const { createStore, applyMiddleware } = require("redux");
const { default: thunk } = require("redux-thunk");
const { connect, Provider } = require("react-redux");

const matcher = require("../index.js");

const logger = store => next => action => {
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};

const initialState = { role: undefined};

const reducer = (state, {state: newState}) => Object.assign({}, state, newState);
const setState = (state) => ({ type: "setState", state});
const store = createStore(reducer, initialState, applyMiddleware(thunk, logger));
const App = ({children}) => children;

const Comp = (msg) => connect((state) => state)(
  ({role, children}) => {
    return (
      <div>
        <h2>{msg}</h2>
        {children}
      </div>
    );
  }
);

const options = {
  filter: ({role}) => ({role}),
  guard: true
};

const root = matcher(store.getState, options) ([
  {
    name: "Author",
    predicate: ({role}) => role == "author",
    indexRoute: {component: Comp("index - author")},
    childRoutes: [
      {
        path: "asdf",
        component: Comp ("asdf - author")
      }
    ],
    fallback: () => {
      console.log("TODO: redirect");
    }
  },
  {
    name: "Unauthenticated",
    predicate: () => true,
    indexRoute: {component: Comp("index - default")},
    childRoutes: [
      {
        path: "asdf",
        component: Comp ("asdf - default")
      }
    ],
    fallback: () => {
      console.log("TODO: redirect");
    }
  },
])({
  path: "/",
  component: Comp("hello world!")
});

const Main = (
  <Provider store={store}>
    <Router history={hashHistory} routes={root}/>
  </Provider>
);

render(Main, document.getElementById("root"));
