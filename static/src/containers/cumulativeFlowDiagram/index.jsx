import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { timeFormat } from 'd3-time-format';

import { fetchCumulativeFlowDiagramData } from '../../modules/cumulativeFlowDiagramData';
import CumulativeFlowDiagram from '../../components/CumulativeFlowDiagram';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';
import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';
import filters from '../../modules/filters';

const axesProps = {
    legend: {
        xAxis: t('cumulativeFlowDiagram.label.bottom'),
        yAxis: t('cumulativeFlowDiagram.label.left'),
    },
    ticksCount: {
        xAxis: 30,
    },
    tickFormat: {
        xAxis: timeFormat('%d %B %y'),
    },
};

class CumulativeFlowDiagramContainer extends PureComponent {
    componentDidMount() {
        this.props.fetchCumulativeFlowDiagramData(urlParams.getParams());
    }

    componentWillUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchCumulativeFlowDiagramData(urlParams.getParams());
        }
    }

    render() {
        return (
            <CumulativeFlowDiagram data={this.props.items} isFetching={this.props.isFetching} axesProps={axesProps} />
        );
    }
}

export default connect(
    (state) => ({
        items: state.cumulativeFlowDiagramData.items,
        isFetching: state.cumulativeFlowDiagramData.isFetching,
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        fetchCumulativeFlowDiagramData,
    }
)(CumulativeFlowDiagramContainer);
