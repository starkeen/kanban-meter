import createReducer from './createReducer';

const FILTER_BY_STATUS = 'FILTER_BY_STATUS';

export const changeFilterByStatus = (state) => ({
    type: FILTER_BY_STATUS,
    payload: state.slice(),
});

export default createReducer(
    [
        'STATUS_19695',
        'STATUS_19696',
        'PLANNING',
        'PLANNING_READY',
        'ESTIMATION',
        'ESTIMATION_READY',
        'DEVELOPMENT',
        'DEVELOPMENT_READY',
        'AB_TEST',
        'SUCCESS_DECISION',
        'REMOVE_DEAD_CODE',
    ],
    {
        [FILTER_BY_STATUS]: (state, action) => action.payload,
    }
);
