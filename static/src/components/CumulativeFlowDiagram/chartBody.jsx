import React, { Component } from 'react';
import { select as d3Select } from 'd3-selection';
import { area as d3Area } from 'd3-shape';

const STATUSES = [
    'STATUS_19695',
    'STATUS_19696',
    'PLANNING',
    'PLANNING_READY',
    'ESTIMATION',
    'ESTIMATION_READY',
    'DEVELOPMENT',
    'DEVELOPMENT_READY',
    'AB_TEST',
    'FEEDBACK',
    'CLOSED',
];

export default class ChartBody extends Component {
    areas = [];

    componentDidMount() {
        this.renderSVG(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.renderSVG(nextProps);
    }

    shouldComponentUpdate() {
        return false;
    }

    saveContainerRef = (ref) => {
        this.containerRef = ref;
    };

    renderSVG(props) {
        this.areas.forEach((area) => {
            area.remove();
        });
        this.area = [];

        const { xScale, yScale, stackColors } = props;

        const generateArea = (statusIndex) => {
            return d3Area()
                .x((d) => xScale(new Date(d.date)))
                .y0(yScale(0))
                .y1((d) => yScale(d[STATUSES[statusIndex]]));
        };

        const container = d3Select(this.containerRef);
        for (let i = 0; i < STATUSES.length; i += 1) {
            this.areas.push(
                container
                    .append('path')
                    .datum(props.data)
                    .attr('d', generateArea(i))
                    .attr('fill', stackColors[STATUSES[i]].color)
            );
        }
    }

    render() {
        return <g ref={this.saveContainerRef} />;
    }
}
