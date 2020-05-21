import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';

import { calculateElementMetrics, calculateViewportMetrics } from '../../modules/calculateMetrics';
import './tooltip.css';

const ARROW_WIDTH = 10;

class Tooltip extends Component {
    state = {
        hide: false,
    };

    componentDidMount() {
        this.componentEl = ReactDOM.findDOMNode(this);
        this.tooltipContent = this.componentEl.querySelector('.tooltip__content-wrapper');
        this.handleRender();
    }

    componentDidUpdate() {
        this.handleRender();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location !== this.props.location) {
            this.setState({ hide: true });
        } else {
            this.setState({ hide: false });
        }
    }

    updatePosition() {
        const { metrics } = this.props.tooltip;

        const elemMetrics = calculateElementMetrics(this.componentEl);
        const viewPortMetrics = calculateViewportMetrics();

        if (elemMetrics.width + metrics.clientX + ARROW_WIDTH < viewPortMetrics.width) {
            this.componentEl.style.left = `${metrics.clientX + ARROW_WIDTH}px`;
            this.tooltipContent.classList.remove('tooltip__content-wrapper_right');
        } else {
            this.componentEl.style.left = `${metrics.clientX - ARROW_WIDTH - elemMetrics.width}px`;
            this.tooltipContent.classList.add('tooltip__content-wrapper_right');
        }

        if (elemMetrics.height / 2 + metrics.clientY < viewPortMetrics.height) {
            this.componentEl.style.top = `${metrics.clientY + window.pageYOffset - elemMetrics.height / 2}px`;
        } else {
            this.componentEl.style.top = `${metrics.clientY + window.pageYOffset}px`;
        }
    }

    handleRender() {
        const { message, metrics } = this.props.tooltip;

        if (this.state.hide || !message || !metrics) {
            this.componentEl.style.top = '-10000px';
            return;
        }

        ReactDOM.render(<div className="tooltip__content">{message}</div>, this.tooltipContent, () =>
            this.updatePosition(this.componentEl)
        );
    }

    handleClick = () => {
        if (this.props.tooltip.onClick) {
            this.props.tooltip.onClick();
        }
    };

    render() {
        return (
            <div
                className="tooltip"
                onClick={this.handleClick}
                style={{
                    cursor: this.props.tooltip.onClick ? 'pointer' : 'default',
                }}
            >
                <div className="tooltip__content-wrapper" />
            </div>
        );
    }
}

export default connect(
    (state) => ({
        tooltip: state.tooltip,
    }),
    {}
)(Tooltip);
