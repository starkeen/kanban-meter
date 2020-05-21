import React, { PureComponent } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { scaleTime, scaleLinear } from 'd3-scale';
import { extent as d3extent, max as d3Max } from 'd3-array';

import { Axes, ResponsiveWrapper } from '@hh.ru/react-d3-chart-graphs';

import { toggleDrawerAnimationEnd } from '../../modules/toggleDrawerAnimationEnd';
import { notify } from '../../modules/notificationManager';
import CircularProgress from '../CircularProgress';
import ChartBody from './chartBody';

class Chart extends PureComponent {
    handleMouseMove = (data) => {
        if (data.hasOwnProperty('key') && data.hasOwnProperty('summary')) {
            this.props.notify({ message: `${data.key} ${data.summary}`, show: true });
        }
    };

    handleMouseLeave = () => {
        this.props.notify({ message: '', show: false });
    };

    handleClick = (data) => {
        if (data.hasOwnProperty('key')) {
            window.open(`https://jira.hh.ru/browse/${data.key}`);
        }
    };

    render() {
        const { data, axesProps, margins, chartColors } = this.props;
        const { legend, padding, ticksCount, tickFormat } = axesProps;
        const defaultMargins = { top: 10, right: 10, bottom: 150, left: 80 };
        const canvasMargins = margins || defaultMargins;
        const svgDimensions = {
            width: Math.max(this.props.parentWidth, 300),
            height: 500,
        };

        const datesDomain = d3extent(data, (d) => new Date(d.date));
        const xScale = scaleTime()
            .domain(datesDomain)
            .range([canvasMargins.left, svgDimensions.width - canvasMargins.right]);
        const yScale = scaleLinear()
            .domain([0, d3Max(data, (d) => d.lead_time.value)])
            .range([svgDimensions.height - canvasMargins.bottom, canvasMargins.top]);

        return (
            <svg width={svgDimensions.width} height={svgDimensions.height}>
                <Axes
                    scales={{ xScale, yScale }}
                    padding={padding}
                    margins={canvasMargins}
                    ticksCount={ticksCount}
                    tickFormat={tickFormat}
                    svgDimensions={svgDimensions}
                    legend={legend}
                />
                <ChartBody
                    xScale={xScale}
                    yScale={yScale}
                    data={data}
                    chartColors={chartColors}
                    onMouseMove={this.handleMouseMove}
                    onMouseLeave={this.handleMouseLeave}
                    onClick={this.handleClick}
                />
            </svg>
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
            notify,
        }
    ),
    CircularProgress()
)(ResponsiveWrapper(Chart));
