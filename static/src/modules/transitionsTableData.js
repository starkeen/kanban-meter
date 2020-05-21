import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

export const REQUEST_TRANSITIONS_TABLE_DATA = 'REQUEST_TRANSITIONS_TABLE_DATA';
export const RECEIVE_TRANSITIONS_TABLE_DATA = 'RECEIVE_TRANSITIONS_TABLE_DATA';

const receiveData = (json) => ({
    type: RECEIVE_TRANSITIONS_TABLE_DATA,
    payload: json,
});

const requestData = () => ({
    type: REQUEST_TRANSITIONS_TABLE_DATA,
});

export const fetchTransitionsTableData = (params) => (dispatch) => {
    dispatch(requestData());

    return axios('api/v1/transitions_table', {
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
        [REQUEST_TRANSITIONS_TABLE_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_TRANSITIONS_TABLE_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
