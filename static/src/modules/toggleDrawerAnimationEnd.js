import createReducer from './createReducer';

const TOGGLE_DRAWER_ANIMATION_END = 'TOGGLE_DRAWER_ANIMATION_END';

export const toggleDrawerAnimationEnd = (state) => ({
    type: TOGGLE_DRAWER_ANIMATION_END,
    payload: state,
});

export default createReducer(true, {
    [TOGGLE_DRAWER_ANIMATION_END]: (state, action) => action.payload,
});
