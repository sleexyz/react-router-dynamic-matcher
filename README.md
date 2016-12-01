# React Router Dynamic Matcher

This library provides a nice little API to match to your routes dynamically based on your app's state. 

Currently it only works with redux apps that use [redux-thunk](https://github.com/gaearon/redux-thunk).



## Usage

### Application: Auth Routing
For most applications, you'll probably only want two branches: `Authenticated` and `Unauthenticated`:

See [`./example/index.js`](./example/index.js) for an example.

### Application: Role-based Routing
For more complicated applications, you might have multiple roles.

*TODO:* Provide an example!

### ~Application: Permissions-based Routing~
Currently this library doesn't have a nice way of doing permission-based routing :(

## API
This library is exported as a function, `matcher`, which can be used to modify a route:

```flow
matcher : (getState: () => State, options?: Options) 
  => (branches: [Branch]) 
  => (route: Route) 
  => Route

type Options = {
  filter?: (state: State) => State,
  guard?: boolean
}

type Branch = {
  predicate: (state: State) => boolean,
  indexRoute: IndexRoute,
  childRoutes: [Route],
  fallback?: Action
  name: string
}

```

where


```flow
type Action = ... // Redux-Thunk action

type Dispatch = ... // Redux-Thunk dispatcher

type State = ... // Redux store

type Route = ... // React Router PlainRoute

```

The predicates of the branches are tried in declaration order on the Redux store, and if a predicate succeeds, then React Router will dynamically route with the corresponding `indexRoute` and `childRoute`.

### Options:

#### `guard`

`guard` *is set to true by default.*

When `guard` is true, then the entire component hierarchy will be guarded by a component connected to your redux store that tests the predicate everytime the state changes. 
If the test fails, then `fallback` will run.

For example, one can set `fallback` to a callback that dispatches a redirect action.

When it set to false, then components are not guarded.

#### `filter`

`filter` *is set to* `(x) => x` *by default.*

`filter` just provides a way of ensuring that your dynamic matcher can only see the parts of the app state that you've specified.
