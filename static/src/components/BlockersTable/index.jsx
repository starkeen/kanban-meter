import React from 'react';
import { compose } from 'redux';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import MaterialTableWrapper from '../../components/MaterialTableWrapper';
import t from '../../modules/translations';
import CircularProgress from '../CircularProgress';
import format from '../../modules/formatValues';
import SortCell from '../../components/SortCell';

const rowColumnStyle = {
    padding: '10px 10px',
    width: '60px',
    fontSize: '12px',
    overflow: 'visible',
    whiteSpace: 'normal',
    textOverflow: 'initial',
    wordWrap: 'break-word',
};

const BlockersTable = (props) => {
    const { onClickSell, sort, items, small } = props;

    return (
        <MaterialTableWrapper small={small}>
            <Table fixedHeader={true} fixedFooter={false} selectable={false} multiSelectable={false}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                    <TableRow>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'portfolio_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.portfolio')}
                                sortStatus={sort.portfolio_sort}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'title_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.summary')}
                                sortStatus={sort.title_sort}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'start_flag_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.dateAdd')}
                                sortStatus={sort.start_flag_sort}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'start_status_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.status')}
                                sortStatus={sort.start_status_sort}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'comment_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.comment')}
                                sortStatus={sort.comment_sort}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'end_flag_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.dateRemove')}
                                sortStatus={sort.end_flag_sort}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'end_status_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.status')}
                                sortStatus={sort.end_status_sort}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'flag_days_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.days')}
                                sortStatus={sort.flag_days_sort}
                            />
                        </TableHeaderColumn>
                        <TableHeaderColumn style={rowColumnStyle}>
                            <SortCell
                                sortName={'current_status_sort'}
                                onClickTitle={onClickSell}
                                title={t('blockersTable.currentStatus')}
                                sortStatus={sort.current_status_sort}
                            />
                        </TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody
                    displayRowCheckbox={false}
                    deselectOnClickaway={false}
                    showRowHover={false}
                    stripedRows={true}
                >
                    {items.map((row, index) => (
                        <TableRow key={index}>
                            <TableRowColumn style={rowColumnStyle}>
                                <a
                                    href={`https://jira.hh.ru/browse/${row.task}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {row.task}
                                </a>
                            </TableRowColumn>
                            <TableRowColumn style={rowColumnStyle}>
                                <a
                                    href={`https://jira.hh.ru/browse/${row.task}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {row.name}
                                </a>
                            </TableRowColumn>
                            <TableRowColumn style={rowColumnStyle}>
                                {row.date_from !== '' ? format.formatDateTime(row.date_from) : ''}
                            </TableRowColumn>
                            <TableRowColumn style={rowColumnStyle}>{row.status_from}</TableRowColumn>
                            <TableRowColumn style={rowColumnStyle}>{row.comment}</TableRowColumn>
                            <TableRowColumn style={rowColumnStyle}>
                                {row.date_to !== '' ? format.formatDateTime(row.date_to) : ''}
                            </TableRowColumn>
                            <TableRowColumn style={rowColumnStyle}>{row.status_to}</TableRowColumn>
                            <TableRowColumn style={rowColumnStyle}>{row.count_days}</TableRowColumn>
                            <TableRowColumn style={rowColumnStyle}>{row.current_status}</TableRowColumn>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </MaterialTableWrapper>
    );
};

export default compose(CircularProgress())(BlockersTable);
