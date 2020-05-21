import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import Checkbox from 'material-ui/Checkbox';
import { timeFormat } from 'd3-time-format';

import { fetchBugsUnresolvedData } from '../../modules/bugsUnresolved';
import { notify } from '../../modules/notificationManager';
import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';
import * as constants from '../../modules/constants';
import filters from '../../modules/filters';

import LineCharTime from '../../components/LineCharTime';

class LineCharTimeContainer extends PureComponent {
    state = {
        isTotalChecked: false,
    };

    componentDidMount() {
        this.props.fetchBugsUnresolvedData(urlParams.getParams(), urlParams.getValue('team'));
    }

    componentDidUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchBugsUnresolvedData(urlParams.getParams(), urlParams.getValue('team'));
        }
    }

    changeTotalGraph = (event, isTotalChecked) => {
        this.setState({ isTotalChecked });
    };

    render() {
        const { items, dashboard, isFetching, total } = this.props;
        const axesProps = {
            legend: {
                xAxis: t('lineChartTime.bugsUnresolved.label.bottom'),
                yAxis: t('lineChartTime.bugsUnresolved.label.left'),
            },
            padding: {
                yAxis: 20,
            },
            ticksCount: {
                xAxis: total[0] && total[0].values.length,
                yAxis: items.length > 4 ? items.length : 4,
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
        items: state.bugsUnresolved.items,
        total: state.bugsUnresolved.total,
        isFetching: state.bugsUnresolved.isFetching,
        filterByOpen: urlParams.getValue(constants.INCLUDE_OPEN),
        filterByTeam: urlParams.getValue(constants.TEAM),
        filterDateStart: urlParams.getValue(constants.START_DATE),
        filterDateEnd: urlParams.getValue(constants.END_DATE),
    }),
    {
        fetchBugsUnresolvedData,
        notify,
    }
)(LineCharTimeContainer);
