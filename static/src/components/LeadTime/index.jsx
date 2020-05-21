import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { BarChart } from '@hh.ru/react-d3-chart-graphs';

import { toggleDrawerAnimationEnd } from '../../modules/toggleDrawerAnimationEnd';
import { showTooltip } from '../../modules/tooltip';
import format from '../../modules/formatValues';
import t from '../../modules/translations';

import CircularProgress from '../CircularProgress';

const colorScale = {
    min: '#B2EBF2',
    max: '#00BCD4',
};

const MAX_LABEL_TO_SHOW = 100;

class LeadTimeBarChart extends Component {
    handleBarHover = (datum, event) => {
        if (datum) {
            const message = t('leadTime.barChart.notifyContent')
                .replace('{0}', format.toFixed(datum.percentile, 0))
                .replace('{1}', datum.title.split(' — ')[1])
                .replace('{2}', datum.title)
                .replace('{3}', datum.value);
            this.props.showTooltip({
                message,
                metrics: {
                    clientX: event.clientX,
                    clientY: event.clientY,
                },
                onClick: () => this.handleBarClick(datum),
            });
        } else {
            this.props.showTooltip({ message: '' });
        }
    };

    handleBarClick(datum) {
        if (datum) {
            window.open(`https://jira.hh.ru/issues/?jql=issue%20in%20(${datum.issues})`);
        }
    }

    render() {
        const items = this.props.items;

        const axesProps = {
            legend: {
                xAxis: items.length > MAX_LABEL_TO_SHOW ? '' : t('leadTime.portfolio.label.bottom'),
                yAxis: t('leadTime.portfolio.label.left'),
            },
            padding: {
                xAxis: 0,
            },
            tickFormat: {
                xAxis(value) {
                    if (items.length > MAX_LABEL_TO_SHOW) {
                        return '';
                    }

                    return value;
                },
            },
        };

        return (
            <BarChart
                axesProps={axesProps}
                toggleResize={this.props.toggleDrawerAnimationEndState}
                data={items}
                colorScale={colorScale}
                handleBarHover={this.handleBarHover}
                handleBarClick={this.handleBarClick}
                paddingMultiplier={0}
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
)(LeadTimeBarChart);
