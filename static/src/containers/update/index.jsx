import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import LinearProgress from 'material-ui/LinearProgress';

import { fetchUpdateData, sendUpdateRequest } from '../../modules/updateData';
import format from '../../modules/formatValues';

class UpdateContainer extends Component {
    componentDidMount() {
        this.props.fetchUpdateData();
    }

    updateProject(project) {
        this.props.sendUpdateRequest(project);
    }

    renderUpdateDate(item) {
        if (item.last) {
            return `${format.formatDateTime(item.last.start_date)} — ${format.formatDateTime(item.last.end_date)}`;
        }
        return '—';
    }

    renderItem(item) {
        const control = item.current ? (
            <LinearProgress
                mode={item.current.fetched && item.current.total ? 'determinate' : 'indeterminate'}
                value={item.current.total ? (item.current.fetched * 100) / item.current.total : 0}
            />
        ) : (
            <RaisedButton onClick={() => this.updateProject(item.project)} disabled={this.props.isSending}>
                Обновить
            </RaisedButton>
        );

        return (
            <TableRow key={item.project}>
                <TableRowColumn>{item.project}</TableRowColumn>
                <TableRowColumn>{this.renderUpdateDate(item)}</TableRowColumn>
                <TableRowColumn>{control}</TableRowColumn>
            </TableRow>
        );
    }

    render() {
        return (
            <Table>
                <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                    <TableRow>
                        <TableHeaderColumn>Проект</TableHeaderColumn>
                        <TableHeaderColumn>Последнее обновление</TableHeaderColumn>
                        <TableHeaderColumn>Обновить</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {this.props.items && this.props.items.map(this.renderItem.bind(this))}
                </TableBody>
            </Table>
        );
    }
}

export default connect(
    (state) => ({
        items: state.updateData.items,
        isFetching: state.updateData.isFetching,
        isSending: state.updateData.isSending,
    }),
    {
        fetchUpdateData,
        sendUpdateRequest,
    }
)(UpdateContainer);
