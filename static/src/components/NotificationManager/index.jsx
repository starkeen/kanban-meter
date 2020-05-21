import React from 'react';
import { connect } from 'react-redux';

import Snackbar from 'material-ui/Snackbar';

const notifyStyles = { height: 'auto', lineHeight: '1.4', padding: '12px' };

const NotificationManager = (props) => (
    <Snackbar
        open={props.notificationManager.show}
        message={props.notificationManager.message}
        bodyStyle={notifyStyles}
        autoHideDuration={0}
    />
);

export default connect(
    (state) => ({
        notificationManager: state.notificationManager,
    }),
    {}
)(NotificationManager);
