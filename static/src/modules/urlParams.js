import qs from 'qs';
import getOrCreateStore from '../store';

export default {
    update(paramsName, value) {
        const state = getOrCreateStore().getState();
        const location = state.routing.location;
        const urlParams = qs.parse(location.search, { ignoreQueryPrefix: true });

        if (value === null) {
            delete urlParams[paramsName];
        } else {
            urlParams[paramsName] = value;
        }
        const paramsSerialized = qs.stringify(urlParams, { arrayFormat: 'repeat' });

        return `${location.pathname}?${paramsSerialized}`;
    },

    getValue(paramsName) {
        const state = getOrCreateStore().getState();
        const location = state.routing.location;
        const urlParams = qs.parse(location.search, { ignoreQueryPrefix: true });
        return urlParams[paramsName] || null;
    },

    getParams() {
        const state = getOrCreateStore().getState();
        const location = state.routing.location;
        return qs.parse(location.search, { ignoreQueryPrefix: true });
    },
};
