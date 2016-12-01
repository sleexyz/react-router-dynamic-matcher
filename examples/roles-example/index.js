const React = {createClass} = require("react");
const {Router, hashHistory, Link} = require("react-router");
const {render} = require("react-dom");
const {createStore, applyMiddleware} = require("redux");
const {default: thunk} = require("redux-thunk");
const {connect, Provider} = require("react-redux");

const matcher = require("../../index.js");

const logger = store => next => action => {
  const result = next(action);
  console.log('next state', store.getState());
  return result;
};

const ADMIN = "ADMIN";
const USER = "USER";
const UNAUTHENTICATED = "UNAUTHENTICATED";

const roleToString = (role) => {
    switch (role) {
    case ADMIN: return "Admin";
    case USER: return "User";
    case UNAUTHENTICATED: return "Unauthenticated";
    }
}

const initialState = {role: UNAUTHENTICATED};

const reducer = (state, {state: newState}) => Object.assign({}, state, newState);
const setState = (state) => ({type: "setState", state});
const store = createStore(reducer, initialState, applyMiddleware(thunk, logger));
window.store = store;


const App = connect((state) => state)(createClass({
  _renderButton(role) {
    const onClick = (e) => {
      e.preventDefault();
      this.props.dispatch((dispatch) => {
        dispatch(setState(({role})));
      });
    };
    const buttonText = "Become " + roleToString(role);
    return <button onClick={onClick}>{buttonText}</button>;
  },
  render() {
    return <div>
    <h1>React Router Dynamic Matcher Example - Role</h1>

    <p> {this._renderButton(ADMIN)} </p>
    <p> {this._renderButton(USER)} </p>
    <p> {this._renderButton(UNAUTHENTICATED)} </p>
    <p>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
    </p>
    <div>{this.props.children}</div>
    </div>;
  }
}));

const CustomComponent = (msg) => connect((state) => state)(
  ({role, children}) => {
    return (
        <div>
            <h2>{msg}</h2>
            <h4>{"You are " +  roleToString(role)}</h4>
            {children}
        </div>
    );
  }
);

const Index = CustomComponent("(index)");
const About = CustomComponent("/about");

const options = {
  filter: ({role}) => ({role}),
  guard: true
};

const routes = matcher(store, options) ([
    {
        name: "Admin",
        predicate: ({role}) => role === ADMIN,
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
    name: "User",
    predicate: ({role}) => role === USER,
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
    predicate: ({role}) => role === UNAUTHENTICATED,
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
