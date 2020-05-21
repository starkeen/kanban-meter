import axios from 'axios';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

export const RECEIVE_FILTERS_LABEL_DATA = 'RECEIVE_FILTERS_LABEL_DATA';

export const receivePosts = (json) => ({
    type: RECEIVE_FILTERS_LABEL_DATA,
    payload: json,
});

export const fetchFiltersLabelData = () => (dispatch) => {
    return axios('/api/v1/labels').then(
        ({ data }) => {
            if (data.length === 0) {
                dispatch(notify({ message: t('error.filter'), show: true }));
            }

            dispatch(receivePosts(data));
        },
        () => {
            dispatch(notify({ message: t('error.backend'), show: true }));
        }
    );
};

export default createReducer(
    {
        isFetching: false,
        items: [],
    },
    {
        [RECEIVE_FILTERS_LABEL_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
