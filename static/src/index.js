import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import getOrCreateStore, { history } from './store';
import config from './config';
import App from './containers/app';

import './index.css';

axios.defaults.baseURL = config.apiURL;

injectTapEventPlugin();
const store = getOrCreateStore();

render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <MuiThemeProvider>
                <App />
            </MuiThemeProvider>
        </ConnectedRouter>
    </Provider>,
    document.querySelector('#root')
);
