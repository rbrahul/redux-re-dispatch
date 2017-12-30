let dispatchChannel = [];
let dispatch = null;

let options = {
    logger: true,
    maxActionHistories: 200,
};

const redispatchedCounter = {
    actionQue: [],
    size() {
        return this.actionQue.length;
    },
    push(type) {
        if (this.actionQue.length && this.actionQue[this.actionQue.length - 1] !== type) {
            this.clear();
        }
        this.actionQue.push(type);
    },
    clear() {
        this.actionQue = [];
    }
};

const logger = (object) => {
    console.group('%cAction Redispatched','color:#16B90E;font-size:14px');
    Object.keys(object).forEach(key => {
        console.info(`%c${key}:`, 'color:#33B8FF;font-size:13px;font-weight:bold', object[key]);
    });
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
    if (maxRecursionLimit !== undefined && !isNaN(Number(maxRecursionLimit))) {
        if (redispatchedCounter.size() >= maxRecursionLimit) {
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
