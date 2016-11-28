const React = require("react");
const { Router, hashHistory } = require("react-router");
const { render } = require("react-dom");
const { createStore, applyMiddleware } = require("redux");
const { default: thunk } = require("redux-thunk");
const { connect, Provider } = require("react-redux");

const dynamic = require("../index.js");

const logger = store => next => action => {
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};

const initialState = { role: undefined};

const reducer = (state, {state: newState}) => Object.assign({}, state, newState);
const setState = (state) => ({ type: "setState", state});
const store = createStore(reducer, initialState, applyMiddleware(thunk, logger));

store.dispatch((dispatch) => {
  dispatch(setState({role: "author"}));
});

const App = ({children}) => children;

const Comp = (msg) => connect((state) => state)(
  ({role, children}) => {
    return (
      <div>
        <h2>{msg}</h2>
        <p> role: {role}</p>
        {children}
      </div>
    );
  }
);

// Goal:
// Dynamic routing
// Route guarding with redirect
// Up to you to make sure your conditions are mutually exclusive!


const root = {
  path: "/",
  component: Comp("hello world!")
};

dynamic(store.getState) ([
  {
    predicate: ({role}) => role == "author",
    indexRoute: {component: Comp("index")},
    childRoutes: [
      {
        path: "asdf",
        component: Comp ("asdf")
      }
    ]
  }
])(root);

console.log(root);

const Main =  (
  <Provider store={store}>
    <Router history={hashHistory} routes={root}/>
  </Provider>
);

render(Main, document.getElementById("root"));
