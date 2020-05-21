import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchBoxPlotLeadTime } from '../../modules/boxPlotLeadTimeData';
import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';
import filters from '../../modules/filters';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';

import BoxPlot from '../../components/BoxPlot';

const axesProps = {
    legend: {
        xAxis: t('leadTime.boxPlotTeam.label.bottom'),
        yAxis: t('leadTime.boxPlotTeam.label.left'),
    },
    ticksCount: 4,
};

class BoxPlotTeamContainer extends Component {
    componentDidMount() {
        this.props.fetchBoxPlotLeadTime(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchBoxPlotLeadTime(urlParams.getParams());
        }
    }

    render() {
        const { items, dashboard, isFetching } = this.props;

        return <BoxPlot items={items} isFetching={isFetching} dashboard={dashboard} axesProps={axesProps} />;
    }
}

export default connect(
    (state) => ({
        items: state.boxPlotLeadTimeData.items,
        isFetching: state.boxPlotLeadTimeData.isFetching,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchBoxPlotLeadTime,
    }
)(BoxPlotTeamContainer);
