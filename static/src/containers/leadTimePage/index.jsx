import React, { Component } from 'react';
import { connect } from 'react-redux';

import LeadTime from '../../components/LeadTime';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';
import LeadTimeTable from '../../components/LeadTimeTable';

import { fetchLeadTimeTableData } from '../../modules/leadTimeTableData';
import { fetchLeadTimeBarCharData } from '../../modules/leadTimeBarCharData';
import { changeFilterByStatus } from '../../modules/filterByStatus';
import urlParams from '../../modules/urlParams';
import filters from '../../modules/filters';
import FilterByStatus from '../../components/FilterByStatus';

const DEFAULT_STATUSES = [];

class LeadTimePageContainer extends Component {
    state = {
        value: DEFAULT_STATUSES,
    };

    componentDidMount() {
        this.props.fetchLeadTimeBarCharData(urlParams.getParams());
        this.props.fetchLeadTimeTableData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchLeadTimeBarCharData(urlParams.getParams());
            this.props.fetchLeadTimeTableData(urlParams.getParams());
        }
    }

    changeFilterByStatus = (event, key, value) => {
        this.props.changeFilterByStatus(value);
        this.props.fetchLeadTimeBarCharData(urlParams.getParams());
        this.props.fetchLeadTimeTableData(urlParams.getParams());
    };

    render() {
        const { items, isFetching, chartData, chartIsFetching, dashboard } = this.props;

        return (
            <div>
                <FilterByStatus changeFilterByStatus={this.changeFilterByStatus} />
                <LeadTime items={chartData} isFetching={chartIsFetching} dashboard={dashboard} />
                <LeadTimeTable items={items} isFetching={isFetching} />
            </div>
        );
    }
}

export default connect(
    (state) => ({
        items: state.leadTimeTableData.items,
        chartData: state.leadTimeBarCharData.items,
        chartIsFetching: state.leadTimeBarCharData.isFetching,
        isFetching: state.leadTimeTableData.isFetching,
        small: state.toggleDrawer,
        filterByStatus: state.filterByStatus,
        filterTax: urlParams.getValue('is_tax'),
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchLeadTimeTableData,
        fetchLeadTimeBarCharData,
        changeFilterByStatus,
    }
)(LeadTimePageContainer);
