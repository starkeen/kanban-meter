import axios from 'axios/index';

import t from './translations';
import createReducer from './createReducer';
import { notify } from './notificationManager';

export const REQUEST_UPDATE_DATA = 'REQUEST_UPDATE_DATA';
export const RECEIVE_UPDATE_DATA = 'RECEIVE_UPDATE_DATA';
export const SEND_UPDATE_DATA = 'SEND_UPDATE_DATA';
export const SENT_UPDATE_DATA = 'SENT_UPDATE_DATA';

const receiveData = (json) => ({
    type: RECEIVE_UPDATE_DATA,
    payload: json,
});

const requestData = () => ({
    type: REQUEST_UPDATE_DATA,
});

const sendData = () => ({
    type: SEND_UPDATE_DATA,
});

const sentData = (json) => ({
    type: SENT_UPDATE_DATA,
    payload: json,
});

export const fetchUpdateData = () => (dispatch) => {
    dispatch(requestData());
    return axios('api/v1/update').then(
        ({ data }) => {
            dispatch(receiveData(data));
        },
        () => {
            dispatch(notify({ message: t('error.backend'), show: true }));
        }
    );
};

export const sendUpdateRequest = (project) => (dispatch) => {
    dispatch(sendData());
    return axios.post(`api/v1/update?project=${project}`).then(
        () => {
            dispatch(sentData({ project }));
        },
        () => {
            dispatch(notify({ message: t('error.backend'), show: true }));
        }
    );
};

export default createReducer(
    {
        isFetching: false,
        isSending: false,
        items: [],
    },
    {
        [REQUEST_UPDATE_DATA]: (state) => ({
            ...state,
            isFetching: true,
        }),
        [RECEIVE_UPDATE_DATA]: (state, action) => ({
            ...state,
            isFetching: false,
            items: action.payload,
        }),
        [SEND_UPDATE_DATA]: (state) => ({
            ...state,
            isSending: true,
        }),
        [SENT_UPDATE_DATA]: (state, action) => ({
            ...state,
            items: state.items.map(
                (item) => (action.payload.project === item.project ? { ...item, current: {} } : item)
            ),
            isSending: false,
        }),
    }
);
