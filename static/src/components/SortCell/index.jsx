import React from 'react';
import styled from 'styled-components';

const cellWrapper = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
};

const cellTitle = {
    cursor: 'pointer',
};

const IconUp = styled.i`
    font-style: normal;
    font-size: 14px;
    margin-right: 5px;

    &::before {
        content: '↑';
    }
`;

const IconDown = styled.i`
    font-style: normal;
    font-size: 14px;
    margin-right: 5px;

    &::before {
        content: '↓';
    }
`;

const SortCell = (props) => {
    const { sortName, title, onClickTitle, sortStatus } = props;

    return (
        <div style={cellWrapper}>
            {sortStatus === 'asc' && <IconDown />}
            {sortStatus === 'desc' && <IconUp />}
            <span style={cellTitle} data-name={sortName} onClick={onClickTitle} data-sort={sortStatus}>
                {title}
            </span>
        </div>
    );
};

export default SortCell;
