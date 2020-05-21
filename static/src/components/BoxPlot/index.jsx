import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { BoxPlot } from '@hh.ru/react-d3-chart-graphs';

import format from '../../modules/formatValues';
import t from '../../modules/translations';
import { showTooltip } from '../../modules/tooltip';
import { toggleDrawerAnimationEnd } from '../../modules/toggleDrawerAnimationEnd';

import CircularProgress from '../CircularProgress';

const colorScale = {
    min: '#B2EBF2',
    max: '#00BCD4',
};

class BoxPlotComponent extends Component {
    handleOutlierClick = (datum) => {
        if (datum) {
            window.open(`https://jira.hh.ru/browse/${datum.outlier.key}`);
        }
    };

    handleOutlierHover = (datum, event) => {
        if (datum) {
            this.props.showTooltip({
                message: t('boxplot.hover.outlier')
                    .replace('{0}', datum.outlier.key)
                    .replace('{1}', datum.outlier.title)
                    .replace('{2}', format.toFixedDaysAndHours(datum.outlier.value)),
                metrics: {
                    clientX: event.clientX,
                    clientY: event.clientY,
                },
                onClick: () => this.handleOutlierClick(datum),
            });
        } else {
            this.props.showTooltip({ message: '' });
        }
    };

    handlerBarHover = (datum, event) => {
        if (datum) {
            const message = t('boxplot.hover.bar')
                .replace('{0}', datum.title)
                .replace('{1}', datum.count)
                .replace('{2}', format.toFixedDaysAndHours(datum.numbers.min))
                .replace('{3}', format.toFixedDaysAndHours(datum.numbers.quartiles[0]))
                .replace('{4}', format.toFixedDaysAndHours(datum.numbers.median))
                .replace('{5}', format.toFixedDaysAndHours(datum.numbers.quartiles[1]))
                .replace('{6}', format.toFixedDaysAndHours(datum.numbers.max));
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
        const items = this.props.items;

        return (
            <BoxPlot
                axesProps={this.props.axesProps}
                data={items}
                toggleResize={this.props.toggleDrawerAnimationEndState}
                colorScale={colorScale}
                handleOutlierClick={this.handleOutlierClick}
                handleOutlierHover={this.handleOutlierHover}
                handleBarHover={this.handlerBarHover}
                paddingMultiplier={0.5}
            />
        );
    }
}

export default compose(
    connect(
        (state) => ({
            toggleDrawerAnimationEndState: state.toggleDrawerAnimationEnd,
        }),
        {
            toggleDrawerAnimationEnd,
            showTooltip,
        }
    ),
    CircularProgress()
)(BoxPlotComponent);
