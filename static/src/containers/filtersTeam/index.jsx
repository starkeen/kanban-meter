import React, { Component } from 'react';
import { connect } from 'react-redux';

import { notify } from '../../modules/notificationManager';
import { fetchFiltersTeamData } from '../../modules/filtersTeam';

import FilterTeam from '../../components/FilterTeam';

class FiltersTeamContainer extends Component {
    componentDidMount() {
        this.props.fetchFiltersTeamData();
    }

    render() {
        return <FilterTeam {...this.props} items={this.props.items} />;
    }
}

export default connect(
    (state) => ({
        items: state.filtersTeamData.items,
        isFetching: state.filtersTeamData.isFetching,
    }),
    {
        notify,
        fetchFiltersTeamData,
    }
)(FiltersTeamContainer);
