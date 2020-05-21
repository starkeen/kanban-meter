import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import { CircularProgressComponent } from '../../components/CircularProgress';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';

import { fetchStatisticsLeadTimeData } from '../../modules/statisticsLeadTimeTableData';
import t from '../../modules/translations';
import format from '../../modules/formatValues';
import urlParams from '../../modules/urlParams';
import FilterByStatus from '../../components/FilterByStatus';

import MaterialTableWrapper from '../../components/MaterialTableWrapper';
import filters from '../../modules/filters';
import { changeFilterByStatus } from '../../modules/filterByStatus';

const rowColumnStyle = {
    padding: '0 10px',
    width: '60px',
    fontSize: '12px',
    overflow: 'visible',
    whiteSpace: 'normal',
    textOverflow: 'initial',
    wordWrap: 'break-word',
};

class StatisticsLeadTimeContainer extends Component {
    state = {
        error: false,
        typeError: '',
        fixedHeader: true,
        fixedFooter: false,
        stripedRows: true,
        showRowHover: false,
        selectable: false,
        multiSelectable: false,
        enableSelectAll: false,
        deselectOnClickaway: false,
        showCheckboxes: false,
        height: 'calc(100vh - 180px)',
    };

    componentDidMount() {
        this.props.fetchStatisticsLeadTimeData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchStatisticsLeadTimeData(urlParams.getParams());
        }
    }

    changeFilterByStatus = (event, key, value) => {
        this.props.changeFilterByStatus(value);
        this.props.fetchStatisticsLeadTimeData(urlParams.getParams());
    };

    render() {
        const table = this.props.isFetching ? (
            <CircularProgressComponent fullHeight />
        ) : (
            <MaterialTableWrapper small={this.props.small}>
                <Table
                    height={this.state.height}
                    fixedHeader={this.state.fixedHeader}
                    fixedFooter={this.state.fixedFooter}
                    selectable={this.state.selectable}
                    multiSelectable={this.state.multiSelectable}
                >
                    <TableHeader
                        displaySelectAll={this.state.showCheckboxes}
                        adjustForCheckbox={this.state.showCheckboxes}
                        enableSelectAll={this.state.enableSelectAll}
                    >
                        <TableRow>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {t('statisticsLeadTimeTable.team')}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {t('statisticsLeadTimeTable.max')}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {t('statisticsLeadTimeTable.mean')}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {t('statisticsLeadTimeTable.median')}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {t('statisticsLeadTimeTable.std')}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {t('statisticsLeadTimeTable.efficiency.mean')}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>Эффективность discovery</TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>Эффективность delivery</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={this.state.showCheckboxes}
                        deselectOnClickaway={this.state.deselectOnClickaway}
                        showRowHover={this.state.showRowHover}
                        stripedRows={this.state.stripedRows}
                    >
                        <TableRow>
                            <TableRowColumn style={rowColumnStyle}>
                                {t('statisticsLeadTimeTable.team.hh')}
                            </TableRowColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {format.toFixed(this.props.items.hh.lead_time.max, 2)}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {format.toFixed(this.props.items.hh.lead_time.mean, 2)}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {format.toFixed(this.props.items.hh.lead_time.median, 2)}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {format.toFixed(this.props.items.hh.lead_time.std, 2)}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {format.toFixed(this.props.items.hh.efficiency, 2)}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {format.toFixed(this.props.items.hh.discovery_efficiency, 2)}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={rowColumnStyle}>
                                {format.toFixed(this.props.items.hh.delivery_efficiency, 2)}
                            </TableHeaderColumn>
                        </TableRow>
                        {this.props.items.by_team.map((row) => (
                            <TableRow key={row.team}>
                                <TableRowColumn style={rowColumnStyle}>{row.team}</TableRowColumn>
                                <TableHeaderColumn style={rowColumnStyle}>
                                    {format.toFixed(row.lead_time.max, 2)}
                                </TableHeaderColumn>
                                <TableHeaderColumn style={rowColumnStyle}>
                                    {format.toFixed(row.lead_time.mean, 2)}
                                </TableHeaderColumn>
                                <TableHeaderColumn style={rowColumnStyle}>
                                    {format.toFixed(row.lead_time.median, 2)}
                                </TableHeaderColumn>
                                <TableHeaderColumn style={rowColumnStyle}>
                                    {format.toFixed(row.lead_time.std, 2)}
                                </TableHeaderColumn>
                                <TableHeaderColumn style={rowColumnStyle}>
                                    {format.toFixed(row.efficiency, 2)}
                                </TableHeaderColumn>
                                <TableHeaderColumn style={rowColumnStyle}>
                                    {format.toFixed(row.discovery_efficiency, 2)}
                                </TableHeaderColumn>
                                <TableHeaderColumn style={rowColumnStyle}>
                                    {format.toFixed(row.delivery_efficiency, 2)}
                                </TableHeaderColumn>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </MaterialTableWrapper>
        );

        return (
            <div>
                <FilterByStatus changeFilterByStatus={this.changeFilterByStatus} />
                {table}
            </div>
        );
    }
}

export default connect(
    (state) => ({
        items: state.statisticsLeadTimeTableData.items,
        isFetching: state.statisticsLeadTimeTableData.isFetching,
        small: state.toggleDrawer,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchStatisticsLeadTimeData,
        changeFilterByStatus,
    }
)(StatisticsLeadTimeContainer);
