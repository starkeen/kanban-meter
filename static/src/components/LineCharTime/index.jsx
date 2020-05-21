import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { LineChartTime } from '@hh.ru/react-d3-chart-graphs';

import { toggleDrawerAnimationEnd } from '../../modules/toggleDrawerAnimationEnd';
import { showTooltip } from '../../modules/tooltip';
import format from '../../modules/formatValues';
import t from '../../modules/translations';

import CircularProgress from '../CircularProgress';

const COLORS = [
    '#607D8B',
    '#64DD17',
    '#7E57C2',
    '#EF5350',
    '#880E4F',
    '#009688',
    '#00BCD4',
    '#2196F3',
    '#3F51B5',
    '#66BB6A',
    '#D4E157',
    '#FFCCBC',
    '#FFCA28',
    '#FF7043',
    '#00BFA5',
    '#DD2C00',
    '#795548',
    '#EFEBE9',
    '#FFFDE7',
    '#FFF3E0',
    '#64FFDA',
    '#69F0AE',
    '#B388FF',
    '#E040FB',
];

class LineChartTimeComponent extends Component {
    handleMouseMove = (datum, event) => {
        if (datum) {
            const date = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
            const message = t('lineChartTime.notifyContent')
                .replace('{0}', datum.title)
                .replace('{1}', date.format(new Date(datum.item.date)))
                .replace('{2}', format.toFixed(datum.item.value, 2));
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

    render() {
        const { items, axesProps } = this.props;

        const stackColors = items.reduce((result, item, index) => {
            result[item.title] = {
                color: COLORS[index],
                legend: item.title,
            };
            return result;
        }, {});

        return (
            <LineChartTime
                axesProps={axesProps}
                handleCircleHover={this.handleMouseMove}
                data={items}
                stackColors={stackColors}
                toggleResize={this.props.toggleDrawerAnimationEndState}
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
)(LineChartTimeComponent);
