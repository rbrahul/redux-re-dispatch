let dispatchChannel = [];
let dispatch = null;
let options = {
    logger: true,
    maxActionHistories: 200,
    maxNumberOfReDispatch: 10,
    intervalForResetingDispatch: 3000
};

const redispatchedCounter = {
    actionQue: {},
    size(type) {
        return this.actionQue[type] ? this.actionQue[type].count : 0;
    },
    resetCounter(type) {
        if (this.actionQue[type] &&
            Date.now() - this.actionQue[type].timestamp > options.intervalForResetingDispatch) {
            this.clear(type);
        }
    },
    push(type) {
        this.actionQue[type]= {
            timestamp: Date.now(),
            count: this.actionQue[type] ? this.actionQue[type].count + 1 : 1,
        };
    },
    clear(type) {
       delete this.actionQue[type];
    }
};

const logger = (object) => {
    console.group('%cAction Redispatched','color:#16B90E;font-size:14px');
    Object.keys(object).forEach(key => {
        console.info(`%c${key}:`, 'color:#33B8FF;font-size:13px;font-weight:bold', object[key]);
    });
    console.groupEnd();
}
const maxExecutionLogger = (type, maxNumberOfReDispatch) => {
    console.group('%cReached Maxium number of Re-Dispatch:[REDUX-RE-DISPATCH]','color:#33B8FF;font-size:13px;');
    const message = `${type} has reached the Maxium number (${maxNumberOfReDispatch}) of re-dispatch.
    If you need to increase the limit of re-dispatch for your action you can pass a second argument:
        redispatch(type, maximumNumber);
        or You can configure it in the middlerware also.
        setupRedispatcher({
        ...
        maxNumberOfReDispatch: 15, //the number of re-dispatch you need
        ...
        });
    `;
    console.warn(message);
    console.groupEnd();
}
export const setupRedispatcher = config => store => next => action => {
    dispatch = store.dispatch;
    options = Object.assign({},options, config);
    dispatchChannel.unshift(action);
    dispatchChannel = dispatchChannel.slice(0, options.maxActionHistories);
    return next(action);
  };

 export const redispatch = (type, maxRecursionLimit) => {
    redispatchedCounter.resetCounter(type);
    if (maxRecursionLimit !== undefined && !isNaN(Number(maxRecursionLimit))) {
        if (redispatchedCounter.size(type) >= maxRecursionLimit) {
            options.logger && maxExecutionLogger(type, maxRecursionLimit);
            return;
        }
    } else if(maxRecursionLimit === undefined) {
        if (redispatchedCounter.size(type) >= options.maxNumberOfReDispatch) {
            options.logger && maxExecutionLogger(type, options.maxNumberOfReDispatch);
            return;
        }
    }
    redispatchedCounter.push(type);
    const matchedAction = dispatchChannel.filter(actionItem=> actionItem.type === type);
    if (matchedAction.length) {
        if (options.logger) {
            logger(Object.assign({},
                matchedAction[0],
                {
                    recursionCount: redispatchedCounter.size(),
                    'timestamp': Date.now()
                }));
        }
        return dispatch(matchedAction[0]);
    }
};
