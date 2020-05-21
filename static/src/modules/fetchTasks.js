import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

const REQUEST_TASKS_DATA = 'REQUEST_TASKS_DATA';
const RECEIVE_TASKS_DATA = 'RECEIVE_TASKS_DATA';

const receivePostsTableData = (json) => ({
    type: RECEIVE_TASKS_DATA,
    payload: json,
});

const requestPostsTableData = (state) => ({
    type: REQUEST_TASKS_DATA,
    payload: state,
});

export const fetchTasksData = (portfolio) => (dispatch) => {
    dispatch(requestPostsTableData());
    const params = {
        portfolio,
    };

    return axios('/api/v1/gantt_chart_by_portfolio_tasks', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    }).then(
        ({ data }) => {
            if (data.tasks && data.tasks.length === 0) {
                dispatch(notify({ message: t('error.tasks.notExist'), show: true }));
            }
            dispatch(receivePostsTableData(data));
        },
        () => {
            dispatch(notify({ message: t('error.backend'), show: true }));
        }
    );
};

export default createReducer(
    {
        isFetching: false,
        portfolio: {},
    },
    {
        [REQUEST_TASKS_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_TASKS_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            portfolio: action.payload,
        }),
    }
);
