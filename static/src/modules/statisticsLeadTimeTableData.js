import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

const REQUEST_STATISTICS_LEAD_TIME_TABLE_DATA = 'REQUEST_STATISTICS_LEAD_TIME_TABLE_DATA';
const RECEIVE_STATISTICS_LEAD_TIME_TABLE_DATA = 'RECEIVE_STATISTICS_LEAD_TIME_TABLE_DATA';

const receivePosts = (json) => ({
    type: RECEIVE_STATISTICS_LEAD_TIME_TABLE_DATA,
    payload: json,
});

const requestPosts = () => ({
    type: REQUEST_STATISTICS_LEAD_TIME_TABLE_DATA,
});

export const fetchStatisticsLeadTimeData = (params, order) => (dispatch, getState) => {
    dispatch(requestPosts());
    const { filterByStatus } = getState();
    if (order) {
        params.order_by = order; // eslint-disable-line camelcase
    }
    if (filterByStatus) {
        params.by = filterByStatus;
    }

    return axios('api/v1/team_stats', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    })
        .then((response) => response.data)
        .then(
            (data) => {
                if (data.by_team.length === 0) {
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
        items: {
            by_team: [], // eslint-disable-line camelcase
            hh: {
                lead_time: {}, // eslint-disable-line camelcase
            },
        },
    },
    {
        [REQUEST_STATISTICS_LEAD_TIME_TABLE_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_STATISTICS_LEAD_TIME_TABLE_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
