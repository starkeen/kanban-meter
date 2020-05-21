import React, { Component } from 'react';
import styled from 'styled-components';

import CircularProgress from 'material-ui/CircularProgress';

const CircularProgressWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    ${(props) => (props.fullHeight ? 'height: calc(100vh - 94px)' : '')};
`;

const CircularProgressItem = styled.div`
    ${(props) => (props.fullHeight ? 'margin-top: -80px;' : '')};
`;

export const CircularProgressComponent = (props) => (
    <CircularProgressWrapper fullHeight={props.fullHeight}>
        <CircularProgressItem>
            <CircularProgress size={props.size ? props.size : 80} thickness={props.thickness ? props.thickness : 5} />
        </CircularProgressItem>
    </CircularProgressWrapper>
);

const CircularProgressHOC = () => (WrappedComponent) => {
    return class extends Component {
        render() {
            const { isFetching, dashboard } = this.props;

            if (isFetching) {
                return <CircularProgressComponent fullHeight={!dashboard} />;
            }

            return <WrappedComponent {...this.props} />;
        }
    };
};

export default CircularProgressHOC;
