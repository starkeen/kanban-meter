import createReducer from './createReducer';

const NOTIFICATION_MANAGER = 'NOTIFICATION_MANAGER';

export const notify = (state) => ({
    type: NOTIFICATION_MANAGER,
    payload: state,
});

export default createReducer(
    { message: '', show: false },
    {
        [NOTIFICATION_MANAGER]: (state, action) => action.payload,
    }
);
