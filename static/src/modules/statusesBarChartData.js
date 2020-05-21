import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

const REQUEST_STATUSES_BAR_CHAR_DATA = 'REQUEST_STATUSES_BAR_CHAR_DATA';
const RECEIVE_STATUSES_BAR_CHAR_DATA = 'RECEIVE_STATUSES_BAR_CHAR_DATA';

const receivePosts = (json) => ({
    type: RECEIVE_STATUSES_BAR_CHAR_DATA,
    payload: json,
});

const requestPosts = () => ({
    type: REQUEST_STATUSES_BAR_CHAR_DATA,
});

export const fetchStatusesBarCharData = (params) => (dispatch) => {
    dispatch(requestPosts());

    return axios('api/v1/status_distribution', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    }).then(
        ({ data }) => {
            const totalValues = data.reduce((result, item) => result + item.value, 0);
            data.forEach((item) => {
                item.title = t(`statuses.portfolio.${item.title.toLowerCase()}`);
                item.rate = ((item.value / totalValues) * 100).toFixed(2);
            });

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
        [REQUEST_STATUSES_BAR_CHAR_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_STATUSES_BAR_CHAR_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
