import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

export const REQUEST_STACKED_BAR_CHAR_DATA = 'REQUEST_STACKED_BAR_CHAR_DATA';
export const RECEIVE_STACKED_BAR_CHAR_DATA = 'RECEIVE_STACKED_BAR_CHAR_DATA';

const receivePosts = (json) => ({
    type: RECEIVE_STACKED_BAR_CHAR_DATA,
    payload: json,
});

const requestPosts = () => ({
    type: REQUEST_STACKED_BAR_CHAR_DATA,
});

const MAX_LENGTH_TITLE = 33;

export const fetchStackedBarCharData = (params) => (dispatch) => {
    dispatch(requestPosts());

    return axios('api/v1/time_cycle', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    }).then(
        ({ data }) => {
            const stackedData = data.map((item) => {
                if (item.summary.length > MAX_LENGTH_TITLE) {
                    item.titleBar = `${item.summary.substring(0, MAX_LENGTH_TITLE - 3)}...`;
                } else {
                    item.titleBar = item.summary;
                }
                item.key = item.title;
                item.values.forEach((values) => {
                    values.portfolio = item.title;
                });
                return item;
            });

            if (stackedData.length === 0) {
                dispatch(notify({ message: t('error.filter'), show: true }));
            }
            return dispatch(receivePosts(stackedData));
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
        [REQUEST_STACKED_BAR_CHAR_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_STACKED_BAR_CHAR_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
