import React, { Component } from 'react';
import { connect } from 'react-redux';

import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import { push } from 'react-router-redux';
import dropDownMenuStyle from '../../modules/commonStyles';
import urlParams from '../../modules/urlParams';
import t from '../../modules/translations';

import FilterHeader from '../FilterHeader';

class FiltersTeam extends Component {
    handleChange = (event, index, value) => {
        this.props.push(urlParams.update('team', value));
    };

    renderItems() {
        return this.props.items.map((item) => <MenuItem key={item} value={item} primaryText={item} />);
    }

    render() {
        const filterByTeam = this.props.filterByTeam;

        return (
            <div>
                <FilterHeader>{t('filter.team')}</FilterHeader>
                <DropDownMenu
                    value={filterByTeam && (!Array.isArray(filterByTeam) ? [filterByTeam] : filterByTeam)}
                    onChange={this.handleChange}
                    style={dropDownMenuStyle}
                    multiple
                >
                    {this.renderItems()}
                </DropDownMenu>
            </div>
        );
    }
}

export default connect(
    () => ({
        filterByTeam: urlParams.getValue('team'),
    }),
    {
        push,
    }
)(FiltersTeam);
