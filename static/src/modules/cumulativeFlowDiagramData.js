import axios from 'axios';
import qs from 'qs';

import { notify } from './notificationManager';
import t from './translations';
import createReducer from './createReducer';

export const REQUEST_CUMULATIVE_FLOW_DIAGRAM_DATA = 'REQUEST_CUMULATIVE_FLOW_DIAGRAM_DATA';
export const RECEIVE_CUMULATIVE_FLOW_DIAGRAM_DATA = 'RECEIVE_CUMULATIVE_FLOW_DIAGRAM_DATA';

const receiveData = (json) => ({
    type: RECEIVE_CUMULATIVE_FLOW_DIAGRAM_DATA,
    payload: json,
});

const requestData = () => ({
    type: REQUEST_CUMULATIVE_FLOW_DIAGRAM_DATA,
});

export const fetchCumulativeFlowDiagramData = (params) => (dispatch) => {
    dispatch(requestData());

    return axios('api/v1/cumulative_flow_diagram', {
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
        [REQUEST_CUMULATIVE_FLOW_DIAGRAM_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_CUMULATIVE_FLOW_DIAGRAM_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
    }
);
