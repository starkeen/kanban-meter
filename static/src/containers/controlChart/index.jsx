import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { timeFormat } from 'd3-time-format';

import { fetchControlChartData } from '../../modules/controlChartData';
import ControlChart from '../../components/ControlChart';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';
import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';
import filters from '../../modules/filters';
import { changeFilterByStatus } from '../../modules/filterByStatus';
import FilterByStatus from '../../components/FilterByStatus';

const axesProps = {
    legend: {
        xAxis: t('controlChart.label.bottom'),
        yAxis: t('controlChart.label.left'),
    },
    ticksCount: {
        xAxis: 30,
    },
    tickFormat: {
        xAxis: timeFormat('%d %B %y'),
    },
};

const chartColors = {
    area: '#F8BBD0',
    line: '#1976D2',
    dots: '#E040FB',
};

class ControlChartContainer extends PureComponent {
    componentDidMount() {
        this.props.fetchControlChartData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchControlChartData(urlParams.getParams());
        }
    }

    changeFilterByStatus = (event, key, value) => {
        this.props.changeFilterByStatus(value);
        this.props.fetchControlChartData(urlParams.getParams());
    };

    render() {
        return (
            <div>
                <FilterByStatus changeFilterByStatus={this.changeFilterByStatus} />
                <ControlChart
                    data={this.props.items}
                    isFetching={this.props.isFetching}
                    axesProps={axesProps}
                    dashboard={this.props.dashboard}
                    chartColors={chartColors}
                />
            </div>
        );
    }
}

export default connect(
    (state) => ({
        items: state.controlChartData.items,
        isFetching: state.controlChartData.isFetching,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchControlChartData,
        changeFilterByStatus,
    }
)(ControlChartContainer);
