import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

export const REQUEST_CONTROL_CHART_DATA = 'REQUEST_CONTROL_CHART_DATA';
export const RECEIVE_CONTROL_CHART_DATA = 'RECEIVE_CONTROL_CHART_DATA';

const receiveData = (json) => ({
    type: RECEIVE_CONTROL_CHART_DATA,
    payload: json,
});

const requestData = () => ({
    type: REQUEST_CONTROL_CHART_DATA,
});

export const fetchControlChartData = (params) => (dispatch, getState) => {
    dispatch(requestData());
    const { filterByStatus } = getState();
    if (filterByStatus) {
        params.by = filterByStatus;
    }

    return axios('api/v1/control_chart', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    }).then(
        ({ data }) => {
            if (data.length === 0) {
                dispatch(notify({ message: t('error.filter'), show: true }));
            }

            return dispatch(receiveData(data));
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
        [REQUEST_CONTROL_CHART_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_CONTROL_CHART_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
