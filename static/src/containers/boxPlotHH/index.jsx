import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchBoxPlotHH } from '../../modules/boxPlotHHData';
import { notify } from '../../modules/notificationManager';
import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';

import BoxPlot from '../../components/BoxPlot';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';
import filters from '../../modules/filters';

const axesProps = {
    legend: {
        xAxis: t('leadTime.boxPlotHH.label.bottom'),
        yAxis: t('leadTime.boxPlotHH.label.left'),
    },
    ticksCount: {
        yAxis: 10,
    },
    exponent: 0.25,
};

class BoxPlotHHContainer extends Component {
    componentDidMount() {
        this.props.fetchBoxPlotHH(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchBoxPlotHH(urlParams.getParams());
        }
    }

    render() {
        const { items, dashboard, isFetching, notify } = this.props;

        return (
            <BoxPlot
                notify={notify}
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
        items: state.boxPlotHHData.items,
        isFetching: state.boxPlotHHData.isFetching,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchBoxPlotHH,
        notify,
    }
)(BoxPlotHHContainer);
