import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

const REQUEST_LEAD_TIME_TABLE_DATA = 'REQUEST_LEAD_TIME_TABLE_DATA';
const RECEIVE_LEAD_TIME_TABLE_DATA = 'RECEIVE_LEAD_TIME_TABLE_DATA';

const receivePostsTableData = (json) => ({
    type: RECEIVE_LEAD_TIME_TABLE_DATA,
    payload: json,
});

const requestPostsTableData = (state) => ({
    type: REQUEST_LEAD_TIME_TABLE_DATA,
    payload: state,
});

export const fetchLeadTimeTableData = (params) => (dispatch, getState) => {
    dispatch(requestPostsTableData());
    const { filterByStatus } = getState();
    if (filterByStatus) {
        params.by = filterByStatus;
    }

    return axios('api/v1/time_distribution_percentiles', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    }).then(
        ({ data }) => {
            if (data.length === 0) {
                dispatch(notify({ message: t('error.filter'), show: true }));
            }
            dispatch(receivePostsTableData(data.sort((a, b) => +a.percentile > +b.percentile)));
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
        [REQUEST_LEAD_TIME_TABLE_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_LEAD_TIME_TABLE_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
