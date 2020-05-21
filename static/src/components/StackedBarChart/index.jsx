import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { StackedBarChart } from '@hh.ru/react-d3-chart-graphs';

import { toggleDrawerAnimationEnd } from '../../modules/toggleDrawerAnimationEnd';
import { showTooltip } from '../../modules/tooltip';
import t from '../../modules/translations';
import format from '../../modules/formatValues';
import stackColors from '../../modules/stackColors';

import CircularProgress from '../CircularProgress';

const margins = {
    top: 10,
    right: 10,
    bottom: 200,
    left: 80,
};

const MAX_LABEL_TO_SHOW = 100;

class StackedBarChartComponent extends Component {
    handleBarHover = (datum, event) => {
        if (datum) {
            const statusTranslation = t(`statuses.portfolio.${datum.title.toLowerCase()}`);
            const message = `${datum.portfolio} ${statusTranslation}: ${format.toFixedDaysAndHours(datum.value)}`;
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
            window.open(`https://jira.hh.ru/browse/${datum.portfolio}`);
        }
    }

    render() {
        const { items, toggleDrawerAnimationEndState } = this.props;

        const axesProps = {
            legend: {
                xAxis: items.length > MAX_LABEL_TO_SHOW ? '' : t('stackedBarChart.portfolio.label.bottom'),
                yAxis: t('stackedBarChart.portfolio.label.left'),
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
            <StackedBarChart
                axesProps={axesProps}
                margins={margins}
                data={items}
                toggleResize={toggleDrawerAnimationEndState}
                handleBarHover={this.handleBarHover}
                handleBarClick={this.handleBarClick}
                stackColors={stackColors}
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
)(StackedBarChartComponent);
