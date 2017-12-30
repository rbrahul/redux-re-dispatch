# Redux Re-dispatch
A redux middleware to dispatch recent actions from action history que.

## Installation:

![Redux-Re-Dispatch](https://nodei.co/npm/redux-re-dispatch.png?downloads=true)

**npm**
```bash
$ npm install 'redux-re-dispatch'
```

**For yarn:**
```bash
$ yarn add 'redux-re-dispatch'
```

## Configure Middleware:

```js
...
import { setupRedispatcher } from 'redux-re-dispatch';

const redispatchMiddleware = setupRedispatcher({
    logger: true,
    maxActionHistories: 200,
    intervalForResetingDispatch: 2000
    maxNumberOfReDispatch: 5,
 });

 const middlewares = [redispatchMiddleware];

const store = createStore(rootReducer,initialSte, compose(applyMiddleware(...middlewares)));
...
```
## Options: 

| Property | Data Type | Default Value | Description |
| --- | --- | --- | --- |
| **logger** | *string* | *true* | You can show/hide logs in console when action is redispatched |
| **maxActionHistories** | *integer* | *200* | You can limit the maximum size of collection or que to save actions as history. |
| **intervalForResetingDispatch** | *integer*  | *3000* **(Millisecond)**| You can limit the maximum allocated time for re-dispatching same **actionType**. After every **intervalForResetingDispatch** time slot for each action type, the new time slot will be allocated to reach the max execution limit| If action type **TYPE_X** are executed the **maxNumberOfReDispatch** times then the counter will be reset after  **intervalForResetingDispatch** milliseconds.
| **maxNumberOfReDispatch** | *integer* | *10* | You can define the default number of execution for how many times any action will be re-dispatched using *redispatched(actionType)** when second parameter is omitted. |


## Usage Example: 
This example describes how it can be used with redux-saga. You can use it wherever you want. In this example we are trying to pull all the station information dispatching  **types.GET_STATIONS** action. If any error occurs while getting response from API or by any means then we may need to try the same API call or process again until we get the actual response. But the number of API call or execution should not be infinite.

You don't need to pass any payload when you **redispatch** any **action**. Payload will be added by middleware itself from the previous action of the action history que. So you need to pass the *actionType* and **maxNumberOfDispatch** as parameters. But the second parameter is optional.
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
    ** @param maxNumberOfDispatch {number} - Maximum number of attempt to re-dispatch that action
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
| **redispatch** | **actionType** {string} {**required**}, **maxNumberOfDispatch** {number} {**optional**}  | This method is the main dispatcher that filters actions by **actionType** and dispatches the **most recent** action from the action history **without any payload**. This method dispatches the given action type **maxNumberOfDispatch** times within **intervalForResetingDispatch** milliseconds managing que of actions|

### Made with Love by Rahul Baruri
