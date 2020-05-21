import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import BlockersTable from '../../components/BlockersTable';
import { fetchBlockersTableData } from '../../modules/blockersTableData';
import urlParams from '../../modules/urlParams';
import filters from '../../modules/filters';
import { EXCLUDE_LABEL_TYPE, INCLUDE_LABEL_TYPE } from '../../modules/constants';

class BlockerTablePageContainer extends Component {
    componentDidMount() {
        this.props.fetchBlockersTableData(urlParams.getParams());
    }

    componentDidUpdate(nextProps) {
        if (filters.hasUpdate(nextProps, this.props)) {
            this.props.fetchBlockersTableData(urlParams.getParams());
        }
    }

    getNextSortDirection = (sort) => {
        switch (sort) {
            case 'asc':
                return 'desc';
            case 'desc':
                return null;
            default:
                return 'asc';
        }
    };

    handleSort = (event) => {
        const { name, sort } = event.target.dataset;
        const currentUrlParams = Object.keys(urlParams.getParams());

        currentUrlParams.forEach((param) => {
            if (param.indexOf('_sort') !== -1 && param !== name) {
                this.props.push(urlParams.update(param, null));
            }
        });

        this.props.push(urlParams.update(name, this.getNextSortDirection(sort)));
        this.props.fetchBlockersTableData(urlParams.getParams());
    };

    render() {
        const { isFetching, items } = this.props;

        return (
            <div>
                <BlockersTable
                    sort={{
                        portfolio_sort: this.props.portfolio_sort,
                        title_sort: this.props.title_sort,
                        start_flag_sort: this.props.start_flag_sort,
                        end_flag_sort: this.props.end_flag_sort,
                        start_status_sort: this.props.start_status_sort,
                        comment_sort: this.props.comment_sort,
                        end_status_sort: this.props.end_status_sort,
                        current_status_sort: this.props.current_status_sort,
                        flag_days_sort: this.props.flag_days_sort,
                    }}
                    items={items}
                    isFetching={isFetching}
                    onClickSell={this.handleSort}
                />
            </div>
        );
    }
}

export default connect(
    (state) => ({
        items: state.blockersTableData.items,
        isFetching: state.blockersTableData.isFetching,
        filterTax: urlParams.getValue('is_tax'),
        filterByOpen: urlParams.getValue('include_open'),
        filterByTeam: urlParams.getValue('team'),
        filterDateStart: urlParams.getValue('start_date'),
        filterDateEnd: urlParams.getValue('end_date'),
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
        portfolio_sort: urlParams.getValue('portfolio_sort'),
        title_sort: urlParams.getValue('title_sort'),
        start_flag_sort: urlParams.getValue('start_flag_sort'),
        end_flag_sort: urlParams.getValue('end_flag_sort'),
        start_status_sort: urlParams.getValue('start_status_sort'),
        comment_sort: urlParams.getValue('comment_sort'),
        end_status_sort: urlParams.getValue('end_status_sort'),
        current_status_sort: urlParams.getValue('current_status_sort'),
        flag_days_sort: urlParams.getValue('flag_days_sort'),
    }),
    {
        push,
        fetchBlockersTableData,
    }
)(BlockerTablePageContainer);
