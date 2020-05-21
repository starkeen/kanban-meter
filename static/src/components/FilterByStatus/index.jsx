import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

import { HeaderFilter, HeaderFilterContainer } from '../HeaderFilter';
import t from '../../modules/translations';

class FilterByStatus extends PureComponent {
    render() {
        return (
            <HeaderFilterContainer>
                <HeaderFilter>{t('filter.statuses')}</HeaderFilter>
                <DropDownMenu
                    value={this.props.filterByStatus}
                    onChange={this.props.changeFilterByStatus}
                    style={{ width: '200px' }}
                    multiple
                >
                    <MenuItem value="STATUS_19695" primaryText={t('statuses.portfolio.status_19695')} />
                    <MenuItem value="STATUS_19696" primaryText={t('statuses.portfolio.status_19696')} />
                    <MenuItem value="PLANNING" primaryText={t('statuses.portfolio.planning')} />
                    <MenuItem value="PLANNING_READY" primaryText={t('statuses.portfolio.planning_ready')} />
                    <MenuItem value="ESTIMATION" primaryText={t('statuses.portfolio.estimation')} />
                    <MenuItem value="ESTIMATION_READY" primaryText={t('statuses.portfolio.estimation_ready')} />
                    <MenuItem value="DEVELOPMENT" primaryText={t('statuses.portfolio.development')} />
                    <MenuItem value="DEVELOPMENT_READY" primaryText={t('statuses.portfolio.development_ready')} />
                    <MenuItem value="AB_TEST" primaryText={t('statuses.portfolio.ab_test')} />
                    <MenuItem value="SUCCESS_DECISION" primaryText={t('statuses.portfolio.success_decision')} />
                    <MenuItem value="REMOVE_DEAD_CODE" primaryText={t('statuses.portfolio.remove_dead_code')} />
                    <MenuItem value="FEEDBACK" primaryText={t('statuses.portfolio.feedback')} />
                </DropDownMenu>
            </HeaderFilterContainer>
        );
    }
}

export default connect((state) => ({
    filterByStatus: state.filterByStatus,
}))(FilterByStatus);
