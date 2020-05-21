import createReducer from './createReducer';

const TOOLTIP = 'TOOLTIP';

export const showTooltip = (state) => ({
    type: TOOLTIP,
    payload: state,
});

export default createReducer(
    { message: '', metrics: {} },
    {
        [TOOLTIP]: (state, action) => action.payload,
    }
);
