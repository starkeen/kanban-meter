import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import styled from 'styled-components';

import DatePicker from 'material-ui/DatePicker';

import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';

import FilterHeader from '../FilterHeader';

const FilterDateWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const FilterDateItem = styled.div`
    width: calc(50% - 48px);
    padding: 0 24px;
`;

const datePickerStyle = {
    width: '100%',
    fontSize: '14px',
};

class Filters extends Component {
    changeStartDate = (e, date) => {
        this.props.push(urlParams.update('start_date', date.toISOString()));
    };

    changeEndDate = (e, date) => {
        this.props.push(urlParams.update('end_date', date.toISOString()));
    };

    render() {
        const { filterDateStart, filterDateEnd, shouldDisableStartDate, shouldDisableEndDate } = this.props;

        return (
            <div>
                <FilterHeader>{t('filter.date')}</FilterHeader>
                <FilterDateWrapper>
                    <FilterDateItem>
                        <DatePicker
                            shouldDisableDate={shouldDisableStartDate || undefined}
                            hintText={t('filter.date.hint.from')}
                            textFieldStyle={datePickerStyle}
                            defaultDate={new Date(filterDateStart)}
                            onChange={this.changeStartDate}
                        />
                    </FilterDateItem>
                    <FilterDateItem>
                        <DatePicker
                            shouldDisableDate={shouldDisableEndDate || undefined}
                            hintText={t('filter.date.hint.before')}
                            textFieldStyle={datePickerStyle}
                            defaultDate={new Date(filterDateEnd)}
                            onChange={this.changeEndDate}
                        />
                    </FilterDateItem>
                </FilterDateWrapper>
            </div>
        );
    }
}

export default connect(
    () => ({
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
    }),
    {
        push,
    }
)(Filters);
