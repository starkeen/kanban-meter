import React, { Component } from 'react';
import { connect } from 'react-redux';
import { timeFormat } from 'd3-time-format';
import styled from 'styled-components';
import { GanttChart } from '@hh.ru/react-d3-chart-graphs';

import t from '../../modules/translations';
import Flag from '../Flag';

const MARGINS = { top: 0, right: 10, bottom: 150, left: 125 };

const Hint = styled.span`
    display: block;
    font-size: 12px;
    margin-bottom: -25px;
    padding-left: ${MARGINS.left}px;
`;

class BoxPlotComponent extends Component {
    renderFlags = (chartProps) => {
        const { flags } = this.props;

        return flags.map((item, index) => {
            return <Flag key={`flag-${index}`} data={item} {...chartProps} />;
        });
    };

    render() {
        const { stackColors, data, handleBarHover, handleBarClick, descTask } = this.props;
        const axesProps = {
            legend: {
                xAxis: t('ganttChart.label.left'),
                yAxis: t('ganttChart.label.bottom'),
            },
            padding: {
                xAxis: 5,
                yAxis: 5,
            },
            ticksCount: 6,
            tickFormat: {
                xAxis: timeFormat('%d %B %y'),
                yAxis: (value) => {
                    if (descTask[value].type === 'blocks') {
                        return `${value} (!)`;
                    }

                    return value;
                },
            },
        };

        let showHint = false;

        for (const key in descTask) {
            if (descTask[key].type === 'blocks') {
                showHint = true;
            }
        }

        return (
            <div style={{ width: '100%' }}>
                {showHint ? <Hint>{t('legend.GanttChart.block')}</Hint> : null}
                <GanttChart
                    handleBarHover={handleBarHover}
                    handleBarClick={handleBarClick}
                    toggleResize={this.props.toggleDrawerAnimationEndState}
                    margins={MARGINS}
                    axesProps={axesProps}
                    data={data}
                    paddingMultiplier={0.6}
                    stackColors={stackColors}
                    render={this.renderFlags}
                />
            </div>
        );
    }
}

export default connect((state) => ({
    toggleDrawerAnimationEndState: state.toggleDrawerAnimationEnd,
}))(BoxPlotComponent);
