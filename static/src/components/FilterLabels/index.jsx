import React, { Component } from 'react';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import Dialog from 'material-ui/Dialog';

import FilterHeader from '../FilterHeader';
import { FilterGridRow, FilterGridColumn } from '../FilterGrid';
import DeleteIcon from '../DeleteIcon';
import Input from '../Input';

import t from '../../modules/translations';
import urlParams from '../../modules/urlParams';
import { fetchFiltersLabelData } from '../../modules/filterLabelsData';
import { INCLUDE_LABEL_TYPE, EXCLUDE_LABEL_TYPE } from '../../modules/constants';

const PopoverSearchWrapper = styled.div`
    padding: 12px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgb(224, 224, 224);
`;

const PopoverCheckboxItem = styled.div`
    padding: 10px;
    border-bottom: 1px solid rgb(224, 224, 224);

    &:last-child {
        border: none;
    }
`;

const DIALOG_STYLES = {
    width: '360px',
};

class FilterLabels extends Component {
    state = {
        includeLabelsShow: false,
        excludeLabelsShow: false,
    };

    componentDidMount() {
        this.props.fetchFiltersLabelData();
    }

    showPopover = (event) => {
        const currentTarget = event.currentTarget;

        this.setState({
            [`${currentTarget.getAttribute('data-type')}Show`]: true,
        });
    };

    closeIncludeLabels = () => {
        this.setState({
            includeLabelsShow: false,
            excludeLabelsShow: false,
        });
    };

    setLabels = (event) => {
        const target = event.target;
        if (target.name !== INCLUDE_LABEL_TYPE && target.name !== EXCLUDE_LABEL_TYPE) {
            return;
        }

        let labels = urlParams.getValue(target.name);

        if (Array.isArray(labels)) {
            if (!labels.includes(target.value)) {
                labels.push(target.value);
            } else {
                labels.splice(labels.indexOf(target.value), 1);
            }
        } else if (labels === null) {
            labels = target.value;
        } else if (labels === target.value) {
            labels = null;
        } else {
            labels = [labels, target.value];
        }

        this.props.push(urlParams.update(target.name, labels));
    };

    filterLabels = (event) => {
        const target = event.target;

        if (target.name === INCLUDE_LABEL_TYPE) {
            this.setState({
                includeLabelsFilter: target.value.toLowerCase().trim(),
            });
        } else if (target.name === EXCLUDE_LABEL_TYPE) {
            this.setState({
                excludeLabelsFilter: target.value.toLowerCase().trim(),
            });
        }
    };

    resetLabels = (type) => {
        this.props.push(urlParams.update(type, null));
    };

    renderLabelsCheckbox = (labels, type) => {
        const { filterIncludeLabels, filterExcludeLabels } = this.props;
        let filterLabelsSelected;
        let labelsSortedList = labels;

        if (type === INCLUDE_LABEL_TYPE) {
            filterLabelsSelected = filterIncludeLabels;
            if (!this.state.includeLabelsShow) {
                return null;
            }
        }

        if (type === EXCLUDE_LABEL_TYPE) {
            filterLabelsSelected = filterExcludeLabels;
            if (!this.state.excludeLabelsShow) {
                return null;
            }
        }

        const filterLabelsSelectedIsArray = filterLabelsSelected && Array.isArray(filterLabelsSelected);
        let filterLabelsSelectedArray = [];

        if (filterLabelsSelectedIsArray) {
            filterLabelsSelectedArray = filterLabelsSelected;
        } else if (filterLabelsSelected) {
            filterLabelsSelectedArray = [filterLabelsSelected];
        }

        const notSelectedLabels = labels.filter((label) => !filterLabelsSelectedArray.includes(label));
        labelsSortedList = filterLabelsSelectedArray.concat(notSelectedLabels);

        return labelsSortedList.map((label) => {
            const labelSearch = label.toLowerCase().trim();

            if (
                type === INCLUDE_LABEL_TYPE &&
                this.state.includeLabelsFilter &&
                !labelSearch.includes(this.state.includeLabelsFilter)
            ) {
                return null;
            }
            if (
                type === EXCLUDE_LABEL_TYPE &&
                this.state.excludeLabelsFilter &&
                !labelSearch.includes(this.state.excludeLabelsFilter)
            ) {
                return null;
            }

            return (
                <PopoverCheckboxItem key={`${label}-${type}`}>
                    <Checkbox
                        label={label}
                        name={type}
                        value={label}
                        checked={filterLabelsSelectedArray.includes(label)}
                    />
                </PopoverCheckboxItem>
            );
        });
    };

    render() {
        const { items } = this.props;

        return (
            <div>
                <FilterHeader>{t('filterLabels.header')}</FilterHeader>
                <FilterGridRow>
                    <FilterGridColumn>
                        <RaisedButton onClick={this.showPopover} data-type="includeLabels">
                            {t('filterLabels.include')}
                        </RaisedButton>
                    </FilterGridColumn>
                    <FilterGridColumn>
                        <RaisedButton onClick={this.showPopover} data-type="excludeLabels">
                            {t('filterLabels.exclude')}
                        </RaisedButton>
                    </FilterGridColumn>
                </FilterGridRow>

                <Dialog
                    autoScrollBodyContent
                    open={this.state.includeLabelsShow}
                    data-type="includeLabels"
                    contentStyle={DIALOG_STYLES}
                    onRequestClose={this.closeIncludeLabels}
                >
                    <PopoverSearchWrapper>
                        <Input
                            placeholder={t('filterLabels.placeholder')}
                            value={this.state.includeLabelsFilter || ''}
                            name={INCLUDE_LABEL_TYPE}
                            onChange={this.filterLabels}
                        />
                        <IconButton onClick={this.resetLabels.bind(this, INCLUDE_LABEL_TYPE)}>
                            <DeleteIcon />
                        </IconButton>
                    </PopoverSearchWrapper>
                    <div onClick={this.setLabels}>{this.renderLabelsCheckbox(items, INCLUDE_LABEL_TYPE)}</div>
                </Dialog>

                <Dialog
                    autoScrollBodyContent
                    open={this.state.excludeLabelsShow}
                    data-type="excludeLabels"
                    contentStyle={DIALOG_STYLES}
                    onRequestClose={this.closeIncludeLabels}
                >
                    <PopoverSearchWrapper>
                        <Input
                            placeholder={t('filterLabels.placeholder')}
                            value={this.state.excludeLabelsFilter || ''}
                            name={EXCLUDE_LABEL_TYPE}
                            onChange={this.filterLabels}
                        />
                        <IconButton onClick={this.resetLabels.bind(this, EXCLUDE_LABEL_TYPE)}>
                            <DeleteIcon />
                        </IconButton>
                    </PopoverSearchWrapper>
                    <div onClick={this.setLabels}>{this.renderLabelsCheckbox(items, EXCLUDE_LABEL_TYPE)}</div>
                </Dialog>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        items: state.filterLabelsData.items,
        isFetching: state.filterLabelsData.isFetching,
        filterIncludeLabels: urlParams.getValue(INCLUDE_LABEL_TYPE),
        filterExcludeLabels: urlParams.getValue(EXCLUDE_LABEL_TYPE),
    }),
    {
        push,
        fetchFiltersLabelData,
    }
)(FilterLabels);
