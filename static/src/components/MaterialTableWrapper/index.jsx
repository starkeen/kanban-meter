import React from 'react';
import styled from 'styled-components';

const MaterialTableWrapper = styled.div`
    @media screen and (max-width: 1400px) {
        div + div {
            overflow-x: initial !important;
            overflow-y: initial !important;
        }
    }

    ${(props) =>
        props.small
            ? `@media screen and (min-width: 1400px) and (max-width: 1719px) {
            div + div {
                overflow-x: initial !important;
                overflow-y: initial !important;
            }
        }`
            : ''};
`;

const MaterialTableWrapperComponent = (props) => (
    <MaterialTableWrapper small={props.small}>{props.children}</MaterialTableWrapper>
);

export default MaterialTableWrapperComponent;
