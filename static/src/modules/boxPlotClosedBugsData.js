import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

const REQUEST_BOX_PLOT_CLOSED_BUGS_DATA = 'REQUEST_BOX_PLOT_CLOSED_BUGS_DATA';
const RECEIVE_BOX_PLOT_CLOSED_BUGS_DATA = 'RECEIVE_BOX_PLOT_CLOSED_BUGS_DATA';

const receivePosts = (json) => ({
    type: RECEIVE_BOX_PLOT_CLOSED_BUGS_DATA,
    payload: json,
});

const requestPosts = (state) => ({
    type: REQUEST_BOX_PLOT_CLOSED_BUGS_DATA,
    payload: state,
});

export const fetchBoxPlotClosedBugsData = (params) => (dispatch) => {
    dispatch(requestPosts());

    return axios('api/v1/bugs/boxplot_by_team', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    })
        .then(({ data }) => {
            if (data.length === 0) {
                dispatch(notify({ message: t('error.filter'), show: true }));
            }

            dispatch(receivePosts(data));
        })
        .catch(() => {
            dispatch(notify({ message: t('error.backend'), show: true }));
        });
};

export default createReducer(
    {
        isFetching: false,
        items: [],
    },
    {
        [REQUEST_BOX_PLOT_CLOSED_BUGS_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_BOX_PLOT_CLOSED_BUGS_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
