export default (initiateState, reducerMap) => {
    return function(state, action) {
        const currentState = state !== undefined ? state : initiateState;
        const handler = reducerMap[action.type];
        return handler ? handler(currentState, action) : currentState;
    };
};
