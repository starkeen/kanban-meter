import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { fetchTransitionsTableData } from '../../modules/transitionsTableData';
import t from '../../modules/translations';
import { notify } from '../../modules/notificationManager';
import urlParams from '../../modules/urlParams';
import filters from '../../modules/filters';

import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';

const STATUSES = [
    'STATUS_19695',
    'STATUS_19696',
    'PLANNING',
    'PLANNING_READY',
    'ESTIMATION',
    'ESTIMATION_READY',
    'DEVELOPMENT',
    'DEVELOPMENT_READY',
    'AB_TEST',
    'FEEDBACK',
];

const TableColumn = styled.td`
    padding: 6px;
    min-width: 60px;
    font-size: 12px;
    overflow: visible;
    white-space: normal;
    text-overflow: initial;
    word-break: break-word;
`;

const TableHeadColumn = TableColumn.withComponent('th');
const TableRow = styled.tr``;

const TableBody = styled.tbody`
    &:nth-child(even) {
        ${TableRow}:first-child {
            background: rgba(127, 221, 233, 0.4);
        }
    }

    ${TableColumn}:first-child {
        border-left: ${(props) => (props.background ? `3px solid ${props.background}` : 'none')};
    }
`;

class TransitionsTable extends Component {
    componentDidMount() {
        this.props.fetchTransitionsTableData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchTransitionsTableData(urlParams.getParams());
        }
    }

    render() {
        const rows = STATUSES.map((status) => (
            <TableBody key={status}>
                <TableRow>
                    <TableColumn>{t(`statuses.portfolio.${status.toLowerCase()}`)}</TableColumn>
                    <TableColumn>{this.props.items[`${status}_IN`]}</TableColumn>
                    <TableColumn>{this.props.items[`${status}_OUT`]}</TableColumn>
                </TableRow>
            </TableBody>
        ));

        return (
            <table>
                <thead>
                    <TableRow>
                        <TableHeadColumn>{t('translationsTable.status')}</TableHeadColumn>
                        <TableHeadColumn>{t('translationsTable.incoming')}</TableHeadColumn>
                        <TableHeadColumn>{t('translationsTable.outcoming')}</TableHeadColumn>
                    </TableRow>
                </thead>
                {rows}
            </table>
        );
    }
}

export default connect(
    (state) => ({
        items: state.transitionsTableData.items,
        isFetching: state.transitionsTableData.isFetching,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchTransitionsTableData,
        notify,
    }
)(TransitionsTable);
