import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import FilterHeader from '../FilterHeader';

import dropDownMenuStyle from '../../modules/commonStyles';
import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';

class FilterResolved extends Component {
    handleChange = (event, key, value) => {
        this.props.push(urlParams.update('include_open', value));
    };

    render() {
        const { filterByOpen } = this.props;

        return (
            <div>
                <FilterHeader>{t('filter.byOpen.title')}</FilterHeader>
                <DropDownMenu value={filterByOpen} onChange={this.handleChange} style={dropDownMenuStyle}>
                    <MenuItem value="true" primaryText={t('filter.byOpen.true')} />
                    <MenuItem value="false" primaryText={t('filter.byOpen.false')} />
                </DropDownMenu>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        routePath: state.routing.location.pathname,
        filterByOpen: urlParams.getValue('include_open'),
    }),
    {
        push,
    }
)(FilterResolved);
