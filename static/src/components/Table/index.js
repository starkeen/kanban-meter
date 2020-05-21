import styled from 'styled-components';

export const Table = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    color: #212121;
`;

export const TableHead = styled.div`
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    align-items: stretch;
    border-bottom: 2px solid #80deea;
    border-top: 2px solid #80deea;
    padding-right: 16px;
`;

export const TableBodyContainer = styled.div`
    display: flex;
    max-height: calc(100vh - 172px);
    flex-direction: column;
    overflow-y: scroll;
`;

export const TableRow = styled.div`
    display: inline-flex;
    flex: 1 0 auto;
    align-items: center;
    box-sizing: border-box;
`;

export const TableBody = styled.div`
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    align-items: stretch;

    ${TableRow}:first-child {
        border-left: ${(props) => (props.highlight ? `3px solid ${props.highlight}` : 'none')};
    }

    &:nth-child(even) {
        ${TableRow}:first-child {
            background: rgba(127, 221, 233, 0.4);
        }
    }
`;

export const TableColumn = styled.div`
    flex: 1 0 ${(props) => (props.minWidth ? props.minWidth : '0')};
    width: ${(props) => (props.minWidth ? props.minWidth : '0')};
    font-size: 12px;
    padding: 6px;
    text-align: left;
    word-wrap: break-word;
    color: ${(props) => (props.highlight ? props.highlight : '#000')};
    cursor: ${(props) => (props.cursor ? props.cursor : 'default')};
    text-align: ${(props) => (props.align ? props.align : 'center')};
`;

export const TableHeadColumn = TableColumn.extend`
    font-weight: bold;

    @media (max-width: 1600px) {
        font-size: 9px;
    }
`;
