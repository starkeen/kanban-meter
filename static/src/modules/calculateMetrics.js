function getBoundingRects(element, result) {
    const metrics = {
        left: result.left,
        top: result.top,
    };

    if (window.SVGElement && element instanceof window.SVGElement) {
        metrics.width = element.getBBox().width;
        metrics.height = element.getBBox().height;
    } else {
        metrics.width = element.offsetWidth;
        metrics.height = element.offsetHeight;
    }

    metrics.right = metrics.left + metrics.width;
    metrics.bottom = metrics.top + metrics.height;

    return metrics;
}

export function calculateElementMetrics(element, container) {
    const result = {
        top: 0,
        left: 0,
    };

    let offsetElement = element;

    while (offsetElement && offsetElement !== container) {
        result.top += offsetElement.offsetTop;
        result.left += offsetElement.offsetLeft;
        offsetElement = offsetElement.offsetParent;
    }

    if (container) {
        result.top -= container.scrollTop;
    }

    return getBoundingRects(element, result);
}

export function calculateViewportMetrics(element) {
    const container = element || document.querySelector('#root');
    const result = {
        width: (document.documentElement && document.documentElement.clientWidth) || window.innerWidth,
        height: window.innerHeight - (element ? calculateElementMetrics(container).top : 0),
        left: window.pageXOffset,
        top: element ? calculateElementMetrics(container).top : container.scrollTop,
    };

    result.right = result.left + result.width;
    result.bottom = result.top + result.height;

    return result;
}
