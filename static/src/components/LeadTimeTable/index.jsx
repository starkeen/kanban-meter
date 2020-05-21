import React, { Component } from 'react';
import { compose } from 'redux';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import MaterialTableWrapper from '../../components/MaterialTableWrapper';

import CircularProgress from '../CircularProgress';

import t from '../../modules/translations';
import format from '../../modules/formatValues';

class LeadTimeTable extends Component {
    state = {
        fixedHeader: true,
        fixedFooter: false,
        stripedRows: true,
        showRowHover: false,
        selectable: false,
        multiSelectable: false,
        enableSelectAll: false,
        deselectOnClickaway: false,
        showCheckboxes: false,
    };

    render() {
        return (
            <MaterialTableWrapper small={this.props.small}>
                <Table
                    height={this.state.height}
                    fixedHeader={this.state.fixedHeader}
                    fixedFooter={this.state.fixedFooter}
                    selectable={this.state.selectable}
                    multiSelectable={this.state.multiSelectable}
                >
                    <TableHeader
                        displaySelectAll={this.state.showCheckboxes}
                        adjustForCheckbox={this.state.showCheckboxes}
                        enableSelectAll={this.state.enableSelectAll}
                    >
                        <TableRow>
                            <TableHeaderColumn>{t('percentile')}</TableHeaderColumn>
                            <TableHeaderColumn>{t('days')}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={this.state.showCheckboxes}
                        deselectOnClickaway={this.state.deselectOnClickaway}
                        showRowHover={this.state.showRowHover}
                        stripedRows={this.state.stripedRows}
                    >
                        {this.props.items.map((row) => (
                            <TableRow key={row.percentile}>
                                <TableRowColumn>{row.percentile}</TableRowColumn>
                                <TableRowColumn>{format.toFixedDaysAndHours(row.value)}</TableRowColumn>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </MaterialTableWrapper>
        );
    }
}

export default compose(CircularProgress())(LeadTimeTable);
