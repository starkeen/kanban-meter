import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import Checkbox from 'material-ui/Checkbox';
import { timeFormat } from 'd3-time-format';

import { fetchBugsToTasksData } from '../../modules/bugsToTasksData';
import { notify } from '../../modules/notificationManager';
import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';

import LineCharTime from '../../components/LineCharTime';
import * as constants from '../../modules/constants';
import filters from '../../modules/filters';

class LineCharTimeContainer extends PureComponent {
    state = {
        isTotalChecked: false,
    };

    componentDidMount() {
        this.props.fetchBugsToTasksData(urlParams.getParams(), urlParams.getValue('team'));
    }

    componentDidUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchBugsToTasksData(urlParams.getParams(), urlParams.getValue('team'));
        }
    }

    changeTotalGraph = (event, isTotalChecked) => {
        this.setState({ isTotalChecked });
    };

    render() {
        const { items, dashboard, isFetching, total } = this.props;

        let maxValue = Math.max(...items.map((x) => x.values));

        if (!isFinite(maxValue)) {
            maxValue = 0;
        }

        const axesProps = {
            legend: {
                xAxis: t('lineChartTime.bugToTasks.label.bottom'),
                yAxis: t('lineChartTime.bugToTasks.label.left'),
            },
            padding: {
                xAxis: 0,
                yAxis: 20,
            },
            ticksCount: {
                xAxis: items[0] && items[0].values.length,
                yAxis: maxValue > 4 ? maxValue : 4,
            },
            tickFormat: {
                xAxis: timeFormat('%B %y'),
            },
        };

        return (
            <React.Fragment>
                <Checkbox
                    label={t('bugs.total.checkboxLabel')}
                    onCheck={this.changeTotalGraph}
                    checked={this.state.isTotalChecked}
                />
                <LineCharTime
                    key="bug-to-tasks"
                    items={this.state.isTotalChecked ? total : items}
                    isFetching={isFetching}
                    dashboard={dashboard}
                    axesProps={axesProps}
                />
            </React.Fragment>
        );
    }
}

export default connect(
    (state) => ({
        items: state.bugsToTasksData.items,
        total: state.bugsToTasksData.total,
        isFetching: state.bugsToTasksData.isFetching,
        filterByOpen: urlParams.getValue(constants.INCLUDE_OPEN),
        filterByTeam: urlParams.getValue(constants.TEAM),
        filterDateStart: urlParams.getValue(constants.START_DATE),
        filterDateEnd: urlParams.getValue(constants.END_DATE),
    }),
    {
        fetchBugsToTasksData,
        notify,
    }
)(LineCharTimeContainer);
