import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Legend } from '@hh.ru/react-d3-chart-graphs';
import qs from 'qs';
import IconButton from 'material-ui/IconButton';

import { fetchTasksData } from '../../modules/fetchTasks';
import { fetchGraphData } from '../../modules/graphData';
import t from '../../modules/translations';
import format from '../../modules/formatValues';
import { notify } from '../../modules/notificationManager';
import urlParams from '../../modules/urlParams';

import { CircularProgressComponent } from '../../components/CircularProgress';
import GanttChart from '../../components/GanttChart';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';
import {
    Table,
    TableBody,
    TableBodyContainer,
    TableRow,
    TableHead,
    TableHeadColumn,
    TableColumn,
} from '../../components/Table';
import filters from '../../modules/filters';
import DownloadIcon from '../../components/DownloadIcon';
import config from '../../config';

const HIGHLIGHT_STATUS_DAYS = 25;
const HIGHLIGHT_LEAD_TIME_DAYS = 100;
const HIGHLIGHT_COLOR = '#E57373';

const statusColor = {
    OPEN: '#607D8B',
    REOPENED: '#7E57C2',
    IN_PROGRESS: '#EF5350',
    NEED_REVIEW: '#880E4F',
    REVIEW: '#009688',
    NEED_TESTING: '#00BCD4',
    TESTING_IN_PROGRESS: '#2196F3',
    READY_TO_RELEASE: '#3F51B5',
    MERGED_TO_RC: '#66BB6A',
    RELEASED: '#D4E157',
    CLOSED: '#FFCCBC',
    DEPLOYED: '#FFCA28',
    RESOLVED: '#FF7043',
};

const unknownStatusColor = [
    '#AEEA00',
    '#64DD17',
    '#00C853',
    '#00BFA5',
    '#DD2C00',
    '#795548',
    '#EFEBE9',
    '#FFFDE7',
    '#FFF3E0',
    '#64FFDA',
    '#69F0AE',
    '#B388FF',
    '#E040FB',
];

class TableExampleComplex extends Component {
    descTask = {};

    state = {
        keyPortfolioIsFetching: '',
        hideChart: false,
    };

    componentDidMount() {
        this.props.fetchGraphData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchGraphData(urlParams.getParams());
        }
    }

    touchTap(type) {
        this.props.fetchGraphData(urlParams.getParams(), type);
    }

    downloadCSV() {
        window.open(
            `${config.apiURL}api/v1/raw_table.csv?${qs.stringify(urlParams.getParams(), { arrayFormat: 'repeat' })}`
        );
    }

    delegateClickCell = (event) => {
        const portfolio = event.target.getAttribute('data-portfolio');
        if (portfolio) {
            this.toggleTasks(portfolio);
        }
    };

    toggleTasks(portfolio) {
        if (this.state.keyPortfolioIsFetching === portfolio) {
            this.setState({
                keyPortfolioIsFetching: '',
                hideChart: true,
            });

            return;
        }

        this.setState({
            keyPortfolioIsFetching: portfolio,
        });

        this.props.fetchTasksData(portfolio).then(() => {
            this.setState({
                hideChart: false,
            });
        });
    }

    getTranslateStatus(status) {
        return status.toLowerCase().replace(/_/g, ' ');
    }

    hasHighlightRow(row) {
        return (
            row.STATUS_19695 > HIGHLIGHT_STATUS_DAYS ||
            row.STATUS_19696 > HIGHLIGHT_STATUS_DAYS ||
            row.PLANNING > HIGHLIGHT_STATUS_DAYS ||
            row.PLANNING_READY > HIGHLIGHT_STATUS_DAYS ||
            row.ESTIMATION > HIGHLIGHT_STATUS_DAYS ||
            row.ESTIMATION_READY > HIGHLIGHT_STATUS_DAYS ||
            row.DEVELOPMENT > HIGHLIGHT_STATUS_DAYS ||
            row.DEVELOPMENT_READY > HIGHLIGHT_STATUS_DAYS ||
            row.AB_TEST > HIGHLIGHT_STATUS_DAYS ||
            row.FEEDBACK > HIGHLIGHT_STATUS_DAYS ||
            row.lead_time > HIGHLIGHT_LEAD_TIME_DAYS
        );
    }

    hasHighlightColumn(statusValue) {
        return statusValue > HIGHLIGHT_STATUS_DAYS;
    }

    handleBarHover = (datum) => {
        if (datum) {
            if (datum.format === 'short') {
                const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'numeric', year: 'numeric' });
                let message;

                if (datum.comment) {
                    message = `${datum.titleBar} ${datum.title} ${date.format(new Date(datum.date))} Комментарий: ${
                        datum.comment
                    }`;
                } else {
                    message = `${datum.titleBar} ${datum.title} ${date.format(new Date(datum.date))}`;
                }

                this.props.notify({ message, show: true });
            } else {
                const statusTranslation = this.getTranslateStatus(datum.title);
                const diffDays = (new Date(datum.dateEnd) - new Date(datum.dateStart)) / (1000 * 60 * 60 * 24);
                const message = `${datum.titleBar} ${this.descTask[datum.titleBar].summary},
                связь: ${this.descTask[datum.titleBar].type} в статусе: ${statusTranslation}:
                ${format.toFixedDaysAndHours(diffDays)}`;
                this.props.notify({ message, show: true });
            }
        } else {
            this.props.notify({ message: '', show: false });
        }
    };

    handleBarClick(datum) {
        if (datum) {
            window.open(`https://jira.hh.ru/browse/${datum.titleBar}`);
        }
    }

    renderDiagramTasks(key) {
        const portfolio = this.props.tasksPortfolio.portfolio;

        if (
            this.state.hideChart ||
            portfolio.key !== key ||
            !(Array.isArray(portfolio.tasks) && portfolio.tasks.length !== 0)
        ) {
            return null;
        }

        const stackColors = portfolio.tasks.reduce((stackColors, item) => {
            this.descTask[item.titleBar] = {
                summary: item.summary,
                type: item.type,
            };
            let unknownStatusCount = 0;

            item.values.forEach((item) => {
                let color;
                if (statusColor[item.title]) {
                    color = statusColor[item.title];
                } else {
                    color = unknownStatusColor[unknownStatusCount];
                    unknownStatusCount += 1;
                }
                stackColors[item.title] = {
                    color,
                    legend: this.getTranslateStatus(item.title),
                };
            });
            return stackColors;
        }, {});

        return (
            <TableRow>
                <GanttChart
                    isFetching={this.props.tasksPortfolio.isFetching}
                    descTask={this.descTask}
                    handleBarHover={this.handleBarHover}
                    handleBarClick={this.handleBarClick}
                    toggleResize={this.props.toggleDrawerAnimationEndState}
                    data={portfolio.tasks}
                    stackColors={stackColors}
                    flags={portfolio.flags}
                />
            </TableRow>
        );
    }

    render() {
        if (this.props.isFetching) {
            return <CircularProgressComponent fullHeight />;
        }

        return (
            <div
                style={{
                    width: '100%',
                    overflowX: 'auto',
                    marginTop: '-45px',
                    position: 'relative',
                }}
            >
                <Legend
                    stackColors={[
                        {
                            color: HIGHLIGHT_COLOR,
                            legend: t('legend.dataTable.highlight'),
                        },
                    ]}
                    left
                />
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '0',
                    }}
                >
                    <IconButton primary onClick={this.downloadCSV.bind(this)}>
                        <DownloadIcon />
                    </IconButton>
                </div>
                <Table onClick={this.delegateClickCell} style={{ minWidth: '1220px', marginTop: '10px' }}>
                    <TableHead>
                        <TableRow>
                            <TableHeadColumn
                                minWidth="50px"
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'key')}
                            >
                                {t('portfolio')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                minWidth="220px"
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'summary')}
                            >
                                {t('summary')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'team')}
                                minWidth="20px"
                            >
                                {t('team')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'STATUS_19695')}
                            >
                                {t('statuses.portfolio.status_19695')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'STATUS_19696')}
                            >
                                {t('statuses.portfolio.status_19696')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'PLANNING')}
                            >
                                {t('statuses.portfolio.planning')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'PLANNING_READY')}
                            >
                                {t('statuses.portfolio.planning_ready')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'ESTIMATION')}
                            >
                                {t('statuses.portfolio.estimation')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'ESTIMATION_READY')}
                            >
                                {t('statuses.portfolio.estimation_ready')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'DEVELOPMENT')}
                            >
                                {t('statuses.portfolio.development')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'DEVELOPMENT_READY')}
                            >
                                {t('statuses.portfolio.development_ready')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'AB_TEST')}
                            >
                                {t('statuses.portfolio.ab_test')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'SUCCESS_DECISION')}
                            >
                                {t('statuses.portfolio.success_decision')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'REMOVE_DEAD_CODE')}
                            >
                                {t('statuses.portfolio.remove_dead_code')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'FEEDBACK')}
                            >
                                {t('statuses.portfolio.feedback')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'created')}
                            >
                                {t('create')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'resolved')}
                            >
                                {t('resolved')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'lead_time')}
                            >
                                {t('leadTime')}
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'discovery_efficiency')}
                            >
                                Эффективность discovery
                            </TableHeadColumn>
                            <TableHeadColumn
                                cursor="pointer"
                                title={t('sort')}
                                onClick={this.touchTap.bind(this, 'delivery_efficiency')}
                            >
                                Эффективность delivery
                            </TableHeadColumn>
                        </TableRow>
                    </TableHead>
                    <TableBodyContainer>
                        {this.props.items.map((row) => (
                            <TableBody key={row.key} highlight={this.hasHighlightRow(row) ? HIGHLIGHT_COLOR : ''}>
                                <TableRow>
                                    <TableColumn minWidth="50px" data-portfolio={row.key} cursor="pointer">
                                        {this.state.keyPortfolioIsFetching === row.key &&
                                        this.props.tasksPortfolio.isFetching ? (
                                            <CircularProgressComponent size={13} thickness={1} />
                                        ) : (
                                            row.key
                                        )}
                                    </TableColumn>
                                    <TableColumn minWidth="220px" align="left">
                                        <a
                                            href={`https://jira.hh.ru/browse/${row.key}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {row.summary}
                                        </a>
                                    </TableColumn>
                                    <TableColumn minWidth="20px">{row.team}</TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.STATUS_19695) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.STATUS_19695)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.STATUS_19696) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.STATUS_19696)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.PLANNING) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.PLANNING)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.PLANNING_READY) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.PLANNING_READY)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.ESTIMATION) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.ESTIMATION)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.ESTIMATION_READY) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.ESTIMATION_READY)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.DEVELOPMENT) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.DEVELOPMENT)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={
                                            this.hasHighlightColumn(row.DEVELOPMENT_READY) ? HIGHLIGHT_COLOR : ''
                                        }
                                    >
                                        {format.toFixed(row.DEVELOPMENT_READY)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.AB_TEST) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.AB_TEST)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.SUCCESS_DECISION) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.SUCCESS_DECISION)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.REMOVE_DEAD_CODE) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.REMOVE_DEAD_CODE)}
                                    </TableColumn>
                                    <TableColumn
                                        highlight={this.hasHighlightColumn(row.FEEDBACK) ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.FEEDBACK)}
                                    </TableColumn>
                                    <TableColumn>{format.formatDate(row.created)}</TableColumn>
                                    <TableColumn>{format.formatDate(row.resolved)}</TableColumn>
                                    <TableColumn
                                        background={row.lead_time > HIGHLIGHT_LEAD_TIME_DAYS ? HIGHLIGHT_COLOR : ''}
                                    >
                                        {format.toFixed(row.lead_time)}
                                    </TableColumn>
                                    <TableColumn>{format.toFixed(row.discovery_efficiency)}</TableColumn>
                                    <TableColumn>{format.toFixed(row.delivery_efficiency)}</TableColumn>
                                </TableRow>
                                {this.renderDiagramTasks(row.key)}
                            </TableBody>
                        ))}
                    </TableBodyContainer>
                </Table>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        items: state.tableDataFetch.items,
        isFetching: state.tableDataFetch.isFetching,
        small: state.toggleDrawer,
        tasksPortfolio: state.tasksPortfolio,
        toggleDrawerAnimationEndState: state.toggleDrawerAnimationEnd,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchTasksData,
        fetchGraphData,
        notify,
    }
)(TableExampleComplex);
