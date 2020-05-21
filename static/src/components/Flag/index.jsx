import React from 'react';

const Flag = (props) => {
    const { scales, data, height } = props;
    const { xScale, yScale } = scales;
    const dateInitial = new Date(data.date);
    const x = xScale(dateInitial);
    const y = yScale(data.task);
    const coords = `${x},${y} ${x + height / 2},${y + height / 2} ${x + height / 2},${y + height / 2} ${x},${y +
        height / 2} ${x},${y + height}`;
    const revertCoords = `${x},${y} ${x - height / 2},${y + height / 2} ${x - height / 2},${y + height / 2} ${x},${y +
        height / 2} ${x},${y + height}`;

    return (
        <polygon
            points={data.state === 'off' ? revertCoords : coords}
            style={props.isClickable ? { cursor: 'pointer' } : {}}
            fill="#ED1C24"
            stroke="#ED1C24"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            data-datum={JSON.stringify({
                ...data,
                title: data.state === 'off' ? 'Флаг снят' : 'Флаг установлен',
                comment: data.comment,
                titleBar: data.task,
                metrics: { left: x, top: y, height },
                format: 'short',
            })}
        />
    );
};

export default Flag;
