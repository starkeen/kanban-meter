import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchBoxPlotStatuses } from '../../modules/boxPlotStatusesData';
import { notify } from '../../modules/notificationManager';
import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';

import BoxPlot from '../../components/BoxPlot';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';
import filters from '../../modules/filters';

const axesProps = {
    legend: {
        xAxis: t('leadTime.boxPlotStatuses.label.bottom'),
        yAxis: t('leadTime.boxPlotStatuses.label.left'),
    },
    ticksCount: 4,
};

class BoxPlotTeamContainer extends Component {
    componentDidMount() {
        this.props.fetchBoxPlotStatuses(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchBoxPlotStatuses(urlParams.getParams());
        }
    }

    render() {
        const { items, dashboard, isFetching } = this.props;

        return (
            <BoxPlot
                notify={this.props.notify}
                items={items}
                isFetching={isFetching}
                dashboard={dashboard}
                axesProps={axesProps}
            />
        );
    }
}

export default connect(
    (state) => ({
        items: state.boxPlotStatusesData.items,
        isFetching: state.boxPlotStatusesData.isFetching,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchBoxPlotStatuses,
        notify,
    }
)(BoxPlotTeamContainer);
