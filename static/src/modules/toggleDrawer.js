import createReducer from './createReducer';

const TOGGLE_DRAWER = 'TOGGLE_DRAWER';

export const toggled = (state) => ({
    type: TOGGLE_DRAWER,
    payload: state,
});

export default createReducer(true, {
    [TOGGLE_DRAWER]: (state, action) => action.payload,
});
