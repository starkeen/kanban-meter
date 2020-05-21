import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

const REQUEST_GRAPH_DATA = 'REQUEST_GRAPH_DATA';
const RECEIVE_GRAPH_DATA = 'RECEIVE_GRAPH_DATA';

const receivePosts = (json) => ({
    type: RECEIVE_GRAPH_DATA,
    payload: json,
});

const requestPosts = () => ({
    type: REQUEST_GRAPH_DATA,
});

export const fetchGraphData = (params, order) => (dispatch) => {
    dispatch(requestPosts());

    if (order) {
        params.order_by = order; // eslint-disable-line camelcase
    }

    return axios('api/v1/raw_table', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    })
        .then((response) => response.data)
        .then(
            (data) => {
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
        [REQUEST_GRAPH_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_GRAPH_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
