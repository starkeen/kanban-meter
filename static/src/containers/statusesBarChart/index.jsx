import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchStatusesBarCharData } from '../../modules/statusesBarChartData';
import { toggleDrawerAnimationEnd } from '../../modules/toggleDrawerAnimationEnd';
import { notify } from '../../modules/notificationManager';
import urlParams from '../../modules/urlParams';
import filters from '../../modules/filters';

import StatusesBarChart from '../../components/StatusesBarChart';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';

class StatusesBarChartContainer extends Component {
    componentDidMount() {
        this.props.fetchStatusesBarCharData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchStatusesBarCharData(urlParams.getParams());
        }
    }

    render() {
        const { items, dashboard, isFetching } = this.props;

        return <StatusesBarChart items={items} isFetching={isFetching} dashboard={dashboard} />;
    }
}

export default connect(
    (state) => {
        const { isFetching, items } = state.statusesBarChartData;
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
        fetchStatusesBarCharData,
        toggleDrawerAnimationEnd,
        notify,
    }
)(StatusesBarChartContainer);
