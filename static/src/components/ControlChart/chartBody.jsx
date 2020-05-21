import React, { Component } from 'react';
import { select as d3Select } from 'd3-selection';
import { area as d3Area, line as d3Line } from 'd3-shape';

import './controlChart.css';

export default class ChartBody extends Component {
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
        if (this.line) {
            this.line.remove();
        }
        if (this.area) {
            this.area.remove();
        }
        if (this.dots) {
            this.dots.remove();
        }

        const { xScale, yScale, chartColors } = props;

        const area = d3Area()
            .x((d) => xScale(new Date(d.date)))
            .y0((d) => yScale(Math.max(d.lead_time.std_from || d.lead_time.mean, 0)))
            .y1((d) => yScale(d.lead_time.std_to || d.lead_time.mean));
        const line = d3Line()
            .x((d) => xScale(new Date(d.date)))
            .y((d) => yScale(d.lead_time.mean));

        const container = d3Select(this.containerRef);
        this.area = container
            .append('path')
            .datum(props.data)
            .attr('d', area)
            .attr('fill', chartColors.area)
            .attr('opacity', 0.5);
        this.line = container
            .append('path')
            .datum(props.data)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', chartColors.line)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1.5);
        this.dots = container
            .selectAll('.dot')
            .data(props.data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('r', 3.5)
            .attr('cx', (d) => xScale(new Date(d.date)))
            .attr('cy', (d) => yScale(d.lead_time.value))
            .attr('data-title', (d) => d.title)
            .style('fill', chartColors.dots)
            .on('mousemove', props.onMouseMove)
            .on('mouseleave', props.onMouseLeave)
            .on('click', props.onClick);
    }

    render() {
        return <g ref={this.saveContainerRef} />;
    }
}
