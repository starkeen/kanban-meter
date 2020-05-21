import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

const REQUEST_LEAD_TIME_BAR_CHAR_DATA = 'REQUEST_LEAD_TIME_BAR_CHAR_DATA';
const RECEIVE_LEAD_TIME_BAR_CHAR_DATA = 'RECEIVE_LEAD_TIME_BAR_CHAR_DATA';

const receivePosts = (json) => ({
    type: RECEIVE_LEAD_TIME_BAR_CHAR_DATA,
    payload: json,
});

const requestPosts = (state) => ({
    type: REQUEST_LEAD_TIME_BAR_CHAR_DATA,
    payload: state,
});

export const fetchLeadTimeBarCharData = (params) => (dispatch, getState) => {
    dispatch(requestPosts());
    const BAR_CHART_STEP = 5;
    const { filterByStatus } = getState();
    if (filterByStatus) {
        params.by = filterByStatus;
    }

    params.step = BAR_CHART_STEP;

    return axios('api/v1/time_distribution', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    }).then(
        ({ data }) => {
            if (data.length === 0) {
                dispatch(notify({ message: t('error.filter'), show: true }));
            }
            return dispatch(receivePosts(data));
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
        [REQUEST_LEAD_TIME_BAR_CHAR_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_LEAD_TIME_BAR_CHAR_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
