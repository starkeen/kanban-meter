import axios from 'axios';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

export const REQUEST_FILTERS_TEAM_DATA = 'REQUEST_FILTERS_TEAM_DATA';
export const RECEIVE_FILTERS_TEAM_DATA = 'RECEIVE_FILTERS_TEAM_DATA';

export const receivePosts = (json) => ({
    type: RECEIVE_FILTERS_TEAM_DATA,
    payload: json,
});

export const fetchFiltersTeamData = () => (dispatch) => {
    return axios('api/v1/teams').then(
        ({ data }) => {
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
        [REQUEST_FILTERS_TEAM_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_FILTERS_TEAM_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
