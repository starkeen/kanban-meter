import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

const REQUEST_RESOLVED_TO_CREATED_DATA = 'REQUEST_RESOLVED_TO_CREATED_DATA';
const RECEIVE_RESOLVED_TO_CREATED_DATA = 'RECEIVE_RESOLVED_TO_CREATED_DATA';

const receivePosts = (json) => ({
    type: RECEIVE_RESOLVED_TO_CREATED_DATA,
    payload: json,
});

const requestPosts = (state) => ({
    type: REQUEST_RESOLVED_TO_CREATED_DATA,
    payload: state,
});

export const fetchBugsResolvedToCreated = (params, team) => (dispatch, getState) => {
    dispatch(requestPosts());

    return axios('api/v1/bugs/resolved_to_created', {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    })
        .then(({ data }) => {
            const total = {
                title: (Array.isArray(team) ? team.join(', ') : team) || getState().filtersTeamData.items.join(', '),
                values: data.total.values,
            };

            if (data.by_team && data.by_team.length === 0) {
                dispatch(notify({ message: t('error.filter'), show: true }));
            }

            dispatch(
                receivePosts({
                    items: data.by_team,
                    total: [total],
                })
            );
        })
        .catch(() => {
            dispatch(notify({ message: t('error.backend'), show: true }));
        });
};

export default createReducer(
    {
        isFetching: false,
        items: [],
        total: [],
    },
    {
        [REQUEST_RESOLVED_TO_CREATED_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_RESOLVED_TO_CREATED_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload.items,
            total: action.payload.total,
        }),
    }
);
