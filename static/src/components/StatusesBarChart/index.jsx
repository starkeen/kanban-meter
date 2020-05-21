import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { BarChart } from '@hh.ru/react-d3-chart-graphs';

import { toggleDrawerAnimationEnd } from '../../modules/toggleDrawerAnimationEnd';
import { showTooltip } from '../../modules/tooltip';
import t from '../../modules/translations';

import CircularProgress from '../CircularProgress';

const colorScale = {
    min: '#B2EBF2',
    max: '#00BCD4',
};

const axesProps = {
    legend: {
        xAxis: t('barChart.statuses.label.bottom'),
        yAxis: t('barChart.statuses.label.left'),
    },
    tickFormat: {
        yAxis(value) {
            return parseInt(value, 10);
        },
    },
};

class StatusesBarChart extends Component {
    handleBarHover = (datum, event) => {
        if (datum) {
            const message = t('barChart.statuses.notifyContent')
                .replace('{0}', datum.title)
                .replace('{1}', datum.value)
                .replace('{2}', datum.rate);
            this.props.showTooltip({
                message,
                metrics: {
                    clientX: event.clientX,
                    clientY: event.clientY,
                },
            });
        } else {
            this.props.showTooltip({ message: '' });
        }
    };

    render() {
        const { items, toggleDrawerAnimationEndState } = this.props;

        return (
            <BarChart
                axesProps={axesProps}
                toggleResize={toggleDrawerAnimationEndState}
                data={items}
                colorScale={colorScale}
                handleBarHover={this.handleBarHover}
                paddingMultiplier={0.5}
            />
        );
    }
}

export default compose(
    connect(
        (state) => {
            const { toggleDrawerAnimationEnd } = state;

            return {
                toggleDrawerAnimationEndState: toggleDrawerAnimationEnd,
            };
        },
        {
            toggleDrawerAnimationEnd,
            showTooltip,
        }
    ),
    CircularProgress()
)(StatusesBarChart);
