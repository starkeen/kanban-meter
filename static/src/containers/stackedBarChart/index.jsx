import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchStackedBarCharData } from '../../modules/stackedBarChartData';
import { notify } from '../../modules/notificationManager';
import urlParams from '../../modules/urlParams';

import StackedBarChart from '../../components/StackedBarChart';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';
import filters from '../../modules/filters';

class StackedBarChartContainer extends Component {
    componentDidMount() {
        this.props.fetchStackedBarCharData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchStackedBarCharData(urlParams.getParams());
        }
    }

    render() {
        const { items, dashboard, isFetching } = this.props;

        return <StackedBarChart items={items} isFetching={isFetching} dashboard={dashboard} />;
    }
}

export default connect(
    (state) => {
        const { items, isFetching } = state.stackedBarChartData;
        return {
            items,
            isFetching,
            filterByOpen: urlParams.getValue('include_open'),
            filterByTeam: urlParams.getValue('team'),
            filterDateStart: urlParams.getValue('start_date'),
            filterDateEnd: urlParams.getValue('end_date'),
            filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
            filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
        };
    },
    {
        notify,
        fetchStackedBarCharData,
    }
)(StackedBarChartContainer);
