# React Router Dynamic Matcher

This library provides a nice little API to match routes dynamically based on your Redux state.

It works with apps that use redux and [redux-thunk](https://github.com/gaearon/redux-thunk).

---

[React Router R](https://github.com/sleexyz/react-router-r) compatible.

---

## API
This library is exported as a function, `matcher`, which can be used to modify a route:

```js
matcher : (store : Store, options? : Options) 
  => (branches : [Branch]) 
  => (route : Route) 
  => Route

```

where


```js
type Options = {
  guard? : boolean,
  filter? : (state : State) => State
}

type Branch = {
  predicate : (state : State) => boolean,
  indexRoute : IndexRoute,
  childRoutes : [Route],
  fallback? : Action
  name : string
}
```

```js
type Action = ... // Redux-Thunk action

type Dispatch = ... // Redux-Thunk dispatcher

type State = ... // Redux state

type Store = ... // Redux store object

type Route = ... // React Router PlainRoute

```

The predicates of the branches are tried in declaration order on the Redux store, and if a predicate succeeds, then React Router will route with the corresponding branch's `indexRoute` and `childRoutes`.

See [`./examples/auth-example/index.js`](./examples/auth-example/index.js) for an example.

</br>

### Options:

</br>

#### `guard : boolean`

`guard` *is set to true by default.*

When `guard` is true, then the entire component hierarchy will be guarded by a component connected to your redux store that tests the predicate everytime the state changes. 
If the test fails, then `fallback` will run.

For example, one can set `fallback` to a redux-thunk action that redirects a user to the homepage.

When `guard` is set to false, then components are not guarded, and nothing will happen if a user *stays* on a route with what would be a failing predicate.

</br>

#### `filter : (state : State) => State`

`filter` *is set to* `(x) => x` *by default.*

`filter` just provides a way of ensuring that your dynamic matcher can only see the parts of the app state that you've specified. It also fills in as react-redux's `mapStateToProps` for the Guard component, if `guard` is set to true.

</br>

## Applications:

</br>

#### Authentication-based Routing
In many applications, your routes might have two branches: `Authenticated` and `Unauthenticated`.


See [`./examples/auth-example/index.js`](./examples/auth-example/index.js).

</br>

#### Role-based Routing
For more complicated applications, you might have multiple roles, each of which have their own set of routes.

See [`./examples/role-example/index.js`](./examples/role-example/index.js).

</br>

#### ~~Permissions-based Routing~~
Currently this library doesn't have a nice way of doing permission-based routing :'(

