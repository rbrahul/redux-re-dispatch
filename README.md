# Redux Re-dispatch
A redux middleware to dispatch recent actions from history to make your failover experience more comfortable.

## Installation:

```bash
$ npm install 'redux-re-dispatch'
```
## Configure Middleware:

```js
...
import { setupRedispatcher } from 'redux-re-dispatch';

const redispatchMiddleware = setupRedispatcher({
    logger: true,
    maxActionHistories: 200
 });

 const middlewares = [redispatchMiddleware];

const store = createStore(rootReducer,initialSte, compose(applyMiddleware(...middlewares)));
...
```
## Options: 

| Property | Data Type | Default Value | Description |
| --- | --- | --- | --- |
| **logger** | *string* | *true* | You can show/hide logs in console when action is redispatched |
| **maxActionHistories** | *integer* | *200* | You can limit the maximum size of collection or que to save actions as history|

## Usage Example: 
This example describes how it can be used with redux-saga. You can use it wherever you want. In this example we are trying to pull all the station information dispatching  **types.GET_STATIONS** action. If any error occurs while getting response from API or by any means then we may need to try the same API call or process again until we get the actual response. But the number of API call or execution should not be infinite. That's why we need to manage how my attempt it can take to fetch the train stations.

You don't need to pass any payload when you **redispatch** any **action**. Payload will be added by middleware itself. So you need to pass only *actionType* and *number of attemps as parameters*.
```js

import { redispatch } from 'redux-re-dispatch';
...
export function* getAllStationsSaga(payload) {
  try {
    const stations = yield call(fetchAllStations, payload);
    yield [
     put({ type: types.GET_STATIONS_SUCCESS, stations })
   ];
  } catch (error) {
    /*
    ** This will try to fetch all the stations again when thrown exception. Here it will try maximum 3 time to get all the stations as failover.
    ** @param type {string} - it's a action type that will be redispatched from recent history
    ** @param {number} - Maximum number of attempt to re-dispatch that action
    */
    redispatch(types.GET_STATIONS, 3);
    yield [
        put({ type: types.GET_STATIONS_FAILED }),
      ];
  }
};

...
```

## APIs: 
| Method Name| Arguments  | Description |
| --- | --- | --- |
| **setupRedispatcher** | *options* {object} | This method will initialize the re-dispatch middleware using these options|
| **redispatch** | *actionType* {string}, *maxNumberOfDispatch* {number}  | This method is the main dispatcher that filters actions by **actionType** and dispatches the **most recent** action from the action history. This method dispatches the given action type **maxNumberOfDispatch** times when caught exception as failover|

### Made with Love by Rahul Baruri
