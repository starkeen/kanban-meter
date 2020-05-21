import React, { Component } from 'react';
import { connect } from 'react-redux';

import LeadTime from '../../components/LeadTime';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';

import { fetchLeadTimeBarCharData } from '../../modules/leadTimeBarCharData';
import urlParams from '../../modules/urlParams';
import filters from '../../modules/filters';

class LeadTimeBarChartContainer extends Component {
    componentDidMount() {
        this.props.fetchLeadTimeBarCharData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchLeadTimeBarCharData(urlParams.getParams());
        }
    }

    render() {
        const { items, dashboard, isFetching } = this.props;

        return <LeadTime items={items} isFetching={isFetching} dashboard={dashboard} />;
    }
}

export default connect(
    (state) => ({
        items: state.leadTimeBarCharData.items,
        isFetching: state.leadTimeBarCharData.isFetching,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchLeadTimeBarCharData,
    }
)(LeadTimeBarChartContainer);
