const React = {createClass} = require("react");
const {Router, hashHistory, Link} = require("react-router");
const {render} = require("react-dom");
const {createStore, applyMiddleware} = require("redux");
const {default: thunk} = require("redux-thunk");
const {connect, Provider} = require("react-redux");

const matcher = require("../index.js");

const logger = store => next => action => {
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};

const initialState = {authenticated: false};

const reducer = (state, {state: newState}) => Object.assign({}, state, newState);
const setState = (state) => ({type: "setState", state});
const store = createStore(reducer, initialState, applyMiddleware(thunk, logger));
window.store = store;


const App = connect((state) => state)(createClass({
  _onClick(e) {
    e.preventDefault();
    this.props.dispatch((dispatch) => {
      dispatch(setState(({authenticated: !this.props.authenticated})));
    });
  },
  render() {
    const buttonText = this.props.authenticated ? "Logout" : "Login";
    return (
    <div>
      <h1>React Router Dynamic Matcher Example</h1>
      <p>
        <button onClick={this._onClick}>{buttonText}</button>
      </p>
      <p>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
      </p>
      <div>{this.props.children}</div>
    </div>
    );
  }
}));

const CustomComponent = (msg) => connect((state) => state)(
  ({authenticated, children}) => {
    return (
      <div>
        <h2>{msg + ' - ' +  (authenticated ? "authenticated" : "unauthenticated")}</h2>
        {children}
      </div>
    );
  }
);

const options = {
  filter: ({authenticated}) => ({authenticated}),
  guard: true
};

const Index = CustomComponent("(index)");
const About = CustomComponent("/about");

const routes = matcher(store, options) ([
  {
    name: "Authenticated",
    predicate: ({authenticated}) => authenticated === true,
    indexRoute: {component: Index},
    childRoutes: [
      {
        path: "about",
        component: About
      }
    ],
    fallback: (dispatch, getState, extraArgument) => {
      alert("Guard fallback activated: redirecting!");
      hashHistory.push("/");
    }
  },
  {
    name: "Unauthenticated",
    predicate: ({authenticated}) => authenticated === false,
    indexRoute: {component: Index},
    childRoutes: [
      {
        path: "about",
        component: About
      }
    ],
    fallback: (dispatch, getState, extraArgument) => {
      alert("Guard fallback activated: redirecting!");
      hashHistory.push("/");
    }
  },
])({
  path: "/",
  component: App
});

const Main = (
  <Provider store={store}>
    <Router history={hashHistory} routes={routes}/>
  </Provider>
);

render(Main, document.getElementById("root"));
